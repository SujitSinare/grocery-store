import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: { createdAt: 'timestamp', updatedAt: false } })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'User', default: null, index: true })
  userId?: Types.ObjectId; // User performing action (null if anonymous/guest)

  @Prop({ required: true, index: true })
  action: string; // e.g. 'LOGIN', 'CREATE_STORE', 'UPDATE_PRICE', 'STOCK_ADJUSTMENT'

  @Prop({ type: Object, default: {} })
  details: Record<string, any>; // JSON metadata payload of parameters changed

  @Prop({ trim: true })
  ipAddress?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
export type AuditLogAction = 'LOGIN' | 'CREATE_STORE' | 'UPDATE_STORE' | 'DELETE_STORE' | 'ADD_EMPLOYEE' | 'DEACTIVATE_EMPLOYEE' | 'CREATE_PRODUCT' | 'UPDATE_INVENTORY' | 'PROCESS_ORDER' | 'GENERATE_REPORT';
