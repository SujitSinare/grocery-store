import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExpenseDocument = Expense & Document;

@Schema({ timestamps: true })
export class Expense {
  @Prop({ type: Types.ObjectId, ref: 'Store', required: true, index: true })
  storeId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ required: true, default: 0 })
  amount: number;

  @Prop({ required: true, enum: ['rent', 'salaries', 'utilities', 'purchases', 'maintenance', 'other'], default: 'other' })
  category: string;

  @Prop({ required: true, default: Date.now })
  date: Date;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  recordedBy: Types.ObjectId; // Employee who logged the expense
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
