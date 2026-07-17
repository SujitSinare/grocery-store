import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Inventory, InventoryDocument } from './schemas/inventory.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async addOrUpdate(storeId: string, productId: string, data: Partial<Inventory>): Promise<InventoryDocument> {
    const existing = await this.inventoryModel.findOne({
      storeId: new Types.ObjectId(storeId),
      productId: new Types.ObjectId(productId),
    }).exec();

    if (existing) {
      // Update fields
      Object.assign(existing, data);
      const saved = await existing.save();
      await this.verifyLowStock(saved);
      return saved;
    }

    const inventory = new this.inventoryModel({
      ...data,
      storeId: new Types.ObjectId(storeId),
      productId: new Types.ObjectId(productId),
    });

    const saved = await inventory.save();
    await this.verifyLowStock(saved);
    return saved;
  }

  async findStoreInventory(storeId: string, options: {
    lowStockOnly?: boolean;
    search?: string;
    limit?: number;
    skip?: number;
  }): Promise<{ items: InventoryDocument[]; total: number }> {
    const filter: any = { storeId: new Types.ObjectId(storeId) };

    if (options.lowStockOnly) {
      filter.$expr = { $lte: ['$currentStock', '$minStock'] };
    }

    const total = await this.inventoryModel.countDocuments(filter).exec();
    
    let query = this.inventoryModel.find(filter)
      .populate({
        path: 'productId',
        populate: [{ path: 'categoryId' }, { path: 'brandId' }],
      })
      .populate('supplierId');

    if (options.skip) query = query.skip(options.skip);
    if (options.limit) query = query.limit(options.limit);

    const items = await query.exec();

    // If search is provided, we filter in memory or join. Since search targets Product fields:
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      const filtered = items.filter(item => {
        const prod = item.productId as any;
        return prod && (
          prod.name.toLowerCase().includes(searchLower) ||
          prod.sku.toLowerCase().includes(searchLower) ||
          prod.barcode.includes(searchLower)
        );
      });
      return { items: filtered, total: filtered.length };
    }

    return { items, total };
  }

  async findOne(storeId: string, productId: string): Promise<InventoryDocument> {
    const item = await this.inventoryModel.findOne({
      storeId: new Types.ObjectId(storeId),
      productId: new Types.ObjectId(productId),
    })
    .populate('productId')
    .populate('supplierId')
    .exec();

    if (!item) {
      throw new NotFoundException(`Inventory item not found for product in this store`);
    }
    return item;
  }

  async adjustStock(storeId: string, productId: string, qty: number, reason: string): Promise<InventoryDocument> {
    const item = await this.inventoryModel.findOne({
      storeId: new Types.ObjectId(storeId),
      productId: new Types.ObjectId(productId),
    }).exec();

    if (!item) {
      throw new NotFoundException(`Product not found in this store's inventory`);
    }

    item.currentStock += qty;
    if (item.currentStock < 0) {
      throw new ConflictException(`Adjusted stock level cannot go below zero. Available: ${item.currentStock - qty}`);
    }

    const saved = await item.save();
    
    // Emit audit/stock events
    this.eventEmitter.emit('stock.adjusted', {
      storeId,
      productId,
      qtyAdjusted: qty,
      currentStock: saved.currentStock,
      reason,
    });

    await this.verifyLowStock(saved);
    return saved;
  }

  private async verifyLowStock(item: InventoryDocument) {
    if (item.currentStock <= item.minStock) {
      // Fetch product name for notification context
      await item.populate('productId');
      const prod = item.productId as any;
      
      this.eventEmitter.emit('stock.low', {
        storeId: item.storeId.toString(),
        productId: item.productId.toString(),
        productName: prod ? prod.name : 'Unknown Product',
        currentStock: item.currentStock,
        minStock: item.minStock,
      });
    }
  }
}
export { InventoryService };
