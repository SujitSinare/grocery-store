import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SettingsDocument = Settings & Document;

@Schema({ timestamps: true })
export class Settings {
  @Prop({ type: Types.ObjectId, ref: 'Store', default: null, index: true })
  storeId?: Types.ObjectId; // Null signifies system-wide settings

  @Prop({ required: true, trim: true })
  key: string; // e.g., 'system_currency', 'payment_gateways', 'sms_gateway_config'

  @Prop({ type: Object, required: true })
  value: Record<string, any>;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
SettingsSchema.index({ storeId: 1, key: 1 }, { unique: true });
