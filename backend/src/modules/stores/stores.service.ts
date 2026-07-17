import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Store, StoreDocument } from './schemas/store.schema';

@Injectable()
export class StoresService {
  constructor(@InjectModel(Store.name) private storeModel: Model<StoreDocument>) {}

  async create(storeData: Partial<Store>): Promise<StoreDocument> {
    const store = new this.storeModel(storeData);
    return store.save();
  }

  async findAll(): Promise<StoreDocument[]> {
    return this.storeModel.find().populate({
      path: 'managerId',
      select: 'name role email phone',
    }).exec();
  }

  async findOne(id: string): Promise<StoreDocument> {
    const store = await this.storeModel.findById(id).populate({
      path: 'managerId',
      select: 'name role email phone',
    }).exec();
    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }
    return store;
  }

  async update(id: string, updateData: Partial<Store>): Promise<StoreDocument> {
    const store = await this.storeModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }
    return store;
  }

  async setManager(storeId: string, managerId: string): Promise<StoreDocument> {
    const store = await this.storeModel.findById(storeId);
    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }
    store.managerId = new Types.ObjectId(managerId);
    return store.save();
  }

  async setStatus(storeId: string, isActive: boolean): Promise<StoreDocument> {
    const store = await this.storeModel.findByIdAndUpdate(storeId, { isActive }, { new: true }).exec();
    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }
    return store;
  }
}
