import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(userData: Partial<User>): Promise<UserDocument> {
    const existing = await this.findByEmail(userData.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    
    // Check phone unique
    const existingPhone = await this.userModel.findOne({ phone: userData.phone }).exec();
    if (existingPhone) {
      throw new ConflictException('Phone number already registered');
    }

    const hashedPassword = await bcrypt.hash(userData.password || 'Temporary@123', 10);
    const user = new this.userModel({
      ...userData,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
    });
    return user.save();
  }

  async updateOtp(userId: string, otp: string, expiry: Date): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { otp, otpExpiry: expiry }).exec();
  }

  async verifyOtp(email: string, otp: string): Promise<UserDocument | null> {
    const user = await this.findByEmail(email);
    if (!user || user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      return null;
    }
    // Clear OTP on successful validation
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    return user;
  }

  async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { password: newPasswordHash }).exec();
  }
}
