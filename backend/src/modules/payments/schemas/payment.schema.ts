import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true, index: true })
  orderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Store', required: true, index: true })
  storeId: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  amount: number;

  @Prop({ required: true, enum: ['cash', 'upi', 'card', 'split'], default: 'cash' })
  paymentMethod: string;

  @Prop({ required: true, enum: ['pending', 'completed', 'failed'], default: 'pending' })
  status: string;

  @Prop({ trim: true })
  transactionId?: string;

  @Prop({ trim: true })
  upiPayload?: string; // Standardized UPI intent string: upi://pay?pa=...
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
