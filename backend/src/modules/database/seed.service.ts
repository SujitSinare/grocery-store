import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Store, StoreDocument } from '../stores/schemas/store.schema';
import { Employee, EmployeeDocument } from '../employees/schemas/employee.schema';
import { Category, CategoryDocument } from '../products/schemas/category.schema';
import { Brand, BrandDocument } from '../products/schemas/brand.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Inventory, InventoryDocument } from '../inventory/schemas/inventory.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>,
  ) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed() {
    console.log('Checking database seed requirement...');
    const userCount = await this.userModel.countDocuments().exec();
    if (userCount > 0) {
      console.log('Database already has data. Skipping seeder.');
      return;
    }

    console.log('Seeding initial system datasets...');

    // 1. Create Super Admin User
    const hashedAdminPassword = await bcrypt.hash('Admin@12345', 10);
    const superAdmin = await this.userModel.create({
      email: 'admin@saasgrocery.com',
      password: hashedAdminPassword,
      phone: '9999999999',
      role: 'super-admin',
      isActive: true,
    });
    console.log('Seeded Super Admin: admin@saasgrocery.com');

    // 2. Create Default Categories
    const categoryNames = ['Pantry', 'Oils & Ghee', 'Dairy', 'Bakery', 'Fruits & Vegetables', 'Personal Care', 'Household'];
    const categories: Record<string, CategoryDocument> = {};
    for (const catName of categoryNames) {
      const slug = catName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      categories[catName] = await this.categoryModel.create({
        name: catName,
        slug,
        parentId: null,
        storeId: null,
      });
    }
    console.log('Seeded default global categories.');

    // 3. Create Default Brands
    const brandNames = ['Amul', 'Tata', 'Britannia', 'Nestle', 'Surf Excel', 'Aashirvaad'];
    const brands: Record<string, BrandDocument> = {};
    for (const bName of brandNames) {
      brands[bName] = await this.brandModel.create({
        name: bName,
      });
    }
    console.log('Seeded default global brands.');

    // 4. Create Default Products
    const productsData = [
      { name: 'Aashirvaad Shudh Chakki Atta 5kg', sku: 'AAS5KG', barcode: '8901725181223', category: 'Pantry', brand: 'Aashirvaad' },
      { name: 'Tata Salt 1kg', sku: 'TSALT1K', barcode: '8901058002318', category: 'Pantry', brand: 'Tata' },
      { name: 'Amul Fresh Milk 1L', sku: 'AMILK1L', barcode: '8901262151277', category: 'Dairy', brand: 'Amul' },
      { name: 'Amul Butter 500g', sku: 'ABUTT500', barcode: '8901262010154', category: 'Dairy', brand: 'Amul' },
      { name: 'Britannia Marie Gold 250g', sku: 'BMARIE250', barcode: '8901063142276', category: 'Bakery', brand: 'Britannia' },
      { name: 'Surf Excel Easy Wash 1kg', sku: 'SURF1KG', barcode: '8901030753009', category: 'Household', brand: 'Surf Excel' },
    ];

    const seededProducts: ProductDocument[] = [];
    for (const p of productsData) {
      const product = await this.productModel.create({
        name: p.name,
        sku: p.sku,
        barcode: p.barcode,
        description: `${p.name} description`,
        categoryId: categories[p.category]._id,
        brandId: brands[p.brand]._id,
        isGlobal: true,
      });
      seededProducts.push(product);
    }
    console.log('Seeded default product templates.');

    // 5. Create Store Manager & Worker login accounts
    const hashedManagerPassword = await bcrypt.hash('Manager@12345', 10);
    const managerUser = await this.userModel.create({
      email: 'manager@store1.com',
      password: hashedManagerPassword,
      phone: '8888888888',
      role: 'employee',
      isActive: true,
    });

    const hashedWorkerPassword = await bcrypt.hash('Worker@12345', 10);
    const workerUser = await this.userModel.create({
      email: 'worker@store1.com',
      password: hashedWorkerPassword,
      phone: '7777777777',
      role: 'employee',
      isActive: true,
    });

    // Create Customer account
    const hashedCustomerPassword = await bcrypt.hash('Customer@12345', 10);
    await this.userModel.create({
      email: 'customer@gmail.com',
      password: hashedCustomerPassword,
      phone: '9876543210',
      role: 'customer',
      isActive: true,
    });
    console.log('Seeded test employee logins (manager/worker) & customer login.');

    // 6. Create Default Store
    const testStore = await this.storeModel.create({
      _id: new Types.ObjectId('660000000000000000000001') as any,
      name: 'Downtown Supermart',
      gstNumber: '27AAAAA1111A1Z1',
      address: 'Shop No 12, Main Street, Pune, Maharashtra - 411001',
      phone: '0202567890',
      settings: { theme: 'light', language: 'en' },
    });
    console.log('Seeded Store: Downtown Supermart');

    // 7. Associate Manager & Worker Employees to Store
    const managerEmployee = await this.employeeModel.create({
      userId: managerUser._id,
      storeId: testStore._id,
      name: 'Amit Sharma',
      role: 'manager',
      salary: 45000,
      isActive: true,
    });

    await this.employeeModel.create({
      userId: workerUser._id,
      storeId: testStore._id,
      name: 'Rajesh Patil',
      role: 'worker',
      salary: 20000,
      isActive: true,
    });

    // Update Store with its manager ID
    testStore.managerId = managerEmployee._id as any;
    await testStore.save();
    console.log('Mapped employee positions to store.');

    // 8. Seed Store Inventory
    const inventoryStocks = [
      { product: seededProducts[0], qty: 50, purchasePrice: 200, sellingPrice: 240, mrp: 250, gst: 5 },
      { product: seededProducts[1], qty: 100, purchasePrice: 16, sellingPrice: 20, mrp: 20, gst: 0 },
      { product: seededProducts[2], qty: 30, purchasePrice: 50, sellingPrice: 60, mrp: 60, gst: 5 },
      { product: seededProducts[3], qty: 15, purchasePrice: 220, sellingPrice: 245, mrp: 250, gst: 12 },
      { product: seededProducts[4], qty: 80, purchasePrice: 22, sellingPrice: 28, mrp: 30, gst: 18 },
      { product: seededProducts[5], qty: 4, purchasePrice: 110, sellingPrice: 130, mrp: 140, gst: 18 }, // Stock = 4, triggers Low Stock Alert!
    ];

    for (const inv of inventoryStocks) {
      await this.inventoryModel.create({
        storeId: testStore._id,
        productId: inv.product._id,
        openingStock: inv.qty,
        currentStock: inv.qty,
        minStock: 5,
        maxStock: 200,
        reorderLevel: 10,
        purchasePrice: inv.purchasePrice,
        sellingPrice: inv.sellingPrice,
        mrp: inv.mrp,
        gstRate: inv.gst,
        batchNumber: 'BATCH-' + Math.floor(1000 + Math.random() * 9000),
        mfgDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
      });
    }

    console.log('Seeded store inventory details.');
    console.log('Database seeding completed successfully!');
  }
}
