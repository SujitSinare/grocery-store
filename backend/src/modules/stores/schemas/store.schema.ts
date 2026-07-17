import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StoreDocument = Store & Document;

@Schema({ timestamps: true })
export class Store {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true })
  gstNumber: string;

  @Prop({ required: true, trim: true })
  address: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', default: null })
  managerId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object, default: { theme: 'light', language: 'en' } })
  settings: {
    theme: string;
    language: string;
  };
}

export const StoreSchema = SchemaFactory.createForClass(Store);
