import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ required: true, unique: true, index: true })
  invoiceNumber: string; // Format e.g., INV-STOREID-YYYYMMDD-SEQUENCE

  @Prop({ type: Types.ObjectId, ref: 'Order', required: true, unique: true, index: true })
  orderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Store', required: true, index: true })
  storeId: Types.ObjectId;

  @Prop({ trim: true })
  pdfUrl?: string; // Path to generated PDF file
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
