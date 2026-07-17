import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Supplier, SupplierDocument } from './schemas/supplier.schema';

@Injectable()
export class SuppliersService {
  constructor(@InjectModel(Supplier.name) private supplierModel: Model<SupplierDocument>) {}

  async create(storeId: string, supplierData: Partial<Supplier>): Promise<SupplierDocument> {
    const supplier = new this.supplierModel({
      ...supplierData,
      storeId: new Types.ObjectId(storeId),
    });
    return supplier.save();
  }

  async findAllByStore(storeId: string): Promise<SupplierDocument[]> {
    return this.supplierModel.find({ storeId: new Types.ObjectId(storeId) }).exec();
  }

  async findOne(id: string): Promise<SupplierDocument> {
    const supplier = await this.supplierModel.findById(id).exec();
    if (!supplier) {
      throw new NotFoundException(`Supplier record not found`);
    }
    return supplier;
  }

  async update(id: string, updateData: Partial<Supplier>): Promise<SupplierDocument> {
    const supplier = await this.supplierModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!supplier) {
      throw new NotFoundException(`Supplier record not found`);
    }
    return supplier;
  }

  async delete(id: string): Promise<void> {
    const result = await this.supplierModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Supplier record not found`);
    }
  }
}
export { SuppliersService };
