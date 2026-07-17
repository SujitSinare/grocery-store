import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';

@Injectable()
export class CustomersService {
  constructor(@InjectModel(Customer.name) private customerModel: Model<CustomerDocument>) {}

  async create(storeId: string, customerData: Partial<Customer>): Promise<CustomerDocument> {
    const customer = new this.customerModel({
      ...customerData,
      storeId: storeId ? new Types.ObjectId(storeId) : null,
    });
    return customer.save();
  }

  async findAllByStore(storeId: string): Promise<CustomerDocument[]> {
    return this.customerModel.find({ storeId: new Types.ObjectId(storeId) }).exec();
  }

  async findByPhone(phone: string, storeId: string): Promise<CustomerDocument> {
    const customer = await this.customerModel.findOne({ phone, storeId: new Types.ObjectId(storeId) }).exec();
    if (!customer) {
      throw new NotFoundException(`Customer with phone ${phone} not registered`);
    }
    return customer;
  }

  async findOne(id: string): Promise<CustomerDocument> {
    const customer = await this.customerModel.findById(id).exec();
    if (!customer) {
      throw new NotFoundException(`Customer record not found`);
    }
    return customer;
  }

  async addAddress(id: string, address: any): Promise<CustomerDocument> {
    const customer = await this.customerModel.findById(id).exec();
    if (!customer) {
      throw new NotFoundException(`Customer record not found`);
    }
    customer.addresses.push(address);
    return customer.save();
  }
}
