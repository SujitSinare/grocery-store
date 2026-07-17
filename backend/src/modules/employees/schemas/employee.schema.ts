import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EmployeeDocument = Employee & Document;

@Schema({ timestamps: true })
export class Employee {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Store', required: true, index: true })
  storeId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, enum: ['manager', 'worker'], default: 'worker' })
  role: string;

  @Prop({ required: true, default: 0 })
  salary: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now })
  joinedAt: Date;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
export type EmployeeRole = 'manager' | 'worker';
