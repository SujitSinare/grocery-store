import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Brand, BrandDocument } from './schemas/brand.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
  ) {}

  // --- Category Operations ---
  async createCategory(name: string, parentId?: string, storeId?: string): Promise<CategoryDocument> {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const existing = await this.categoryModel.findOne({ slug }).exec();
    if (existing) {
      throw new ConflictException('Category slug already exists');
    }

    const cat = new this.categoryModel({
      name,
      slug,
      parentId: parentId ? new Types.ObjectId(parentId) : null,
      storeId: storeId ? new Types.ObjectId(storeId) : null,
    });
    return cat.save();
  }

  async findAllCategories(storeId?: string): Promise<CategoryDocument[]> {
    const filter: any = { storeId: null }; // Global categories
    if (storeId) {
      filter.storeId = { $in: [null, new Types.ObjectId(storeId)] };
    }
    return this.categoryModel.find(filter).populate('parentId').exec();
  }

  // --- Brand Operations ---
  async createBrand(name: string, logo?: string): Promise<BrandDocument> {
    const existing = await this.brandModel.findOne({ name }).exec();
    if (existing) {
      throw new ConflictException('Brand already exists');
    }
    const brand = new this.brandModel({ name, logo });
    return brand.save();
  }

  async findAllBrands(): Promise<BrandDocument[]> {
    return this.brandModel.find().exec();
  }

  // --- Product Operations ---
  async createProduct(productData: Partial<Product>): Promise<ProductDocument> {
    const existingSku = await this.productModel.findOne({ sku: productData.sku }).exec();
    if (existingSku) {
      throw new ConflictException('Product SKU already exists');
    }

    const existingBarcode = await this.productModel.findOne({ barcode: productData.barcode }).exec();
    if (existingBarcode) {
      throw new ConflictException('Product Barcode already exists');
    }

    const product = new this.productModel(productData);
    return product.save();
  }

  async findAllProducts(options: {
    search?: string;
    categoryId?: string;
    brandId?: string;
    limit?: number;
    skip?: number;
  }): Promise<{ products: ProductDocument[]; total: number }> {
    const filter: any = {};

    if (options.search) {
      filter.$or = [
        { name: { $regex: options.search, $options: 'i' } },
        { sku: { $regex: options.search, $options: 'i' } },
        { barcode: options.search },
      ];
    }

    if (options.categoryId) {
      filter.categoryId = new Types.ObjectId(options.categoryId);
    }

    if (options.brandId) {
      filter.brandId = new Types.ObjectId(options.brandId);
    }

    const total = await this.productModel.countDocuments(filter).exec();
    const products = await this.productModel.find(filter)
      .populate('categoryId')
      .populate('brandId')
      .skip(options.skip || 0)
      .limit(options.limit || 50)
      .exec();

    return { products, total };
  }

  async findByBarcode(barcode: string): Promise<ProductDocument> {
    const product = await this.productModel.findOne({ barcode })
      .populate('categoryId')
      .populate('brandId')
      .exec();
    if (!product) {
      throw new NotFoundException(`Product with barcode ${barcode} not found`);
    }
    return product;
  }

  async findOne(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id)
      .populate('categoryId')
      .populate('brandId')
      .exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async updateProduct(id: string, updateData: Partial<Product>): Promise<ProductDocument> {
    const product = await this.productModel.findByIdAndUpdate(id, updateData, { new: true })
      .populate('categoryId')
      .populate('brandId')
      .exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }
}
