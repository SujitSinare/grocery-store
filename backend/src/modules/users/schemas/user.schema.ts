import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password?: string; // Opt out of returning this in queries by default

  @Prop({ required: true, unique: true, index: true, trim: true })
  phone: string;

  @Prop({ required: true, enum: ['super-admin', 'customer', 'employee'], default: 'customer' })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  otp?: string;

  @Prop()
  otpExpiry?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Ensure password isn't returned by default when converting to JSON
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.otp;
    delete ret.otpExpiry;
    return ret;
  },
});
