import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense, ExpenseDocument } from './schemas/expense.schema';

@Injectable()
export class ExpensesService {
  constructor(@InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>) {}

  async create(storeId: string, employeeId: string, expenseData: Partial<Expense>): Promise<ExpenseDocument> {
    const expense = new this.expenseModel({
      ...expenseData,
      storeId: new Types.ObjectId(storeId),
      recordedBy: new Types.ObjectId(employeeId),
    });
    return expense.save();
  }

  async findAllByStore(storeId: string): Promise<ExpenseDocument[]> {
    return this.expenseModel.find({ storeId: new Types.ObjectId(storeId) })
      .populate('recordedBy', 'name role')
      .sort({ date: -1 })
      .exec();
  }

  async findOne(id: string): Promise<ExpenseDocument> {
    const exp = await this.expenseModel.findById(id).exec();
    if (!exp) {
      throw new NotFoundException(`Expense record not found`);
    }
    return exp;
  }

  async delete(id: string): Promise<void> {
    const result = await this.expenseModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Expense record not found`);
    }
  }
}
export { ExpensesService };
