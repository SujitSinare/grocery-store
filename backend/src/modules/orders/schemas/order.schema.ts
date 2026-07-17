import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema()
class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true, default: 1 })
  qty: number;

  @Prop({ required: true, default: 0 })
  price: number; // Unit selling price

  @Prop({ required: true, default: 0 })
  mrp: number; // Maximum Retail Price

  @Prop({ required: true, default: 0 })
  gstRate: number; // GST rate percentage

  @Prop({ required: true, default: 0 })
  gstAmount: number; // (Price * Qty) * gstRate / 100
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'Store', required: true, index: true })
  storeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Customer', default: null, index: true })
  customerId?: Types.ObjectId;

  @Prop({ required: true, enum: ['pos', 'online'], default: 'pos' })
  orderType: string;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true, default: 0 })
  subTotal: number;

  @Prop({ required: true, default: 0 })
  discount: number;

  @Prop({ type: String, default: null })
  couponCode?: string;

  @Prop({ required: true, default: 0 })
  taxAmount: number; // Total GST collected

  @Prop({ required: true, default: 0 })
  grandTotal: number; // (subTotal + taxAmount) - discount

  @Prop({ required: true, enum: ['pending', 'paid', 'failed'], default: 'pending' })
  paymentStatus: string;

  @Prop({ required: true, enum: ['cash', 'upi', 'card', 'split'], default: 'cash' })
  paymentMethod: string;

  @Prop({ required: true, enum: ['pending', 'processed', 'shipped', 'delivered', 'cancelled'], default: 'pending' })
  orderStatus: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  employeeId?: Types.ObjectId; // Empty if placed online by customer

  @Prop({ trim: true })
  paymentReference?: string; // UPI Txn ID, Card Txn ID, etc.
}

export const OrderSchema = SchemaFactory.createForClass(Order);
export { OrderItem };
