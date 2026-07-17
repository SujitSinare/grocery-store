import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  sku: string;

  @Prop({ required: true, unique: true, index: true, trim: true })
  barcode: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true, index: true })
  categoryId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Brand', required: true, index: true })
  brandId: Types.ObjectId;

  @Prop({ trim: true })
  image?: string;

  @Prop({ default: true })
  isGlobal: boolean; // Accessible by all stores
}

export const ProductSchema = SchemaFactory.createForClass(Product);
