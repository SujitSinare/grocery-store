import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InventoryDocument = Inventory & Document;

@Schema({ timestamps: true })
export class Inventory {
  @Prop({ type: Types.ObjectId, ref: 'Store', required: true, index: true })
  storeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  productId: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  openingStock: number;

  @Prop({ required: true, default: 0 })
  currentStock: number;

  @Prop({ required: true, default: 5 })
  minStock: number; // Low stock alert trigger

  @Prop({ required: true, default: 100 })
  maxStock: number;

  @Prop({ required: true, default: 10 })
  reorderLevel: number;

  @Prop({ required: true, default: 0 })
  purchasePrice: number;

  @Prop({ required: true, default: 0 })
  sellingPrice: number;

  @Prop({ required: true, default: 0 })
  mrp: number;

  @Prop({ required: true, default: 18 })
  gstRate: number; // Percentage (e.g., 5, 12, 18, 28)

  @Prop({ trim: true })
  batchNumber?: string;

  @Prop({ type: Date })
  expiryDate?: Date;

  @Prop({ type: Date })
  mfgDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Supplier', index: true })
  supplierId?: Types.ObjectId;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);
// Create compound unique index to ensure one product profile per store
InventorySchema.index({ storeId: 1, productId: 1 }, { unique: true });
