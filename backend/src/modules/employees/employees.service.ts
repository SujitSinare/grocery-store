import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Employee, EmployeeDocument } from './schemas/employee.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    private usersService: UsersService,
  ) {}

  async create(employeeData: {
    storeId: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    salary: number;
  }): Promise<EmployeeDocument> {
    // 1. Check if user already exists
    const existingUser = await this.usersService.findByEmail(employeeData.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // 2. Create the User login credential
    const user = await this.usersService.create({
      email: employeeData.email,
      phone: employeeData.phone,
      password: 'Employee@12345', // Default temporary password
      role: 'employee',
      isActive: true,
    });

    // 3. Create the Employee profile record
    const employee = new this.employeeModel({
      userId: user._id,
      storeId: new Types.ObjectId(employeeData.storeId),
      name: employeeData.name,
      role: employeeData.role,
      salary: employeeData.salary,
      isActive: true,
    });

    return employee.save();
  }

  async findAllByStore(storeId: string): Promise<EmployeeDocument[]> {
    return this.employeeModel.find({ storeId: new Types.ObjectId(storeId) })
      .populate({
        path: 'userId',
        select: 'email phone role isActive',
      })
      .exec();
  }

  async findOne(id: string): Promise<EmployeeDocument> {
    const emp = await this.employeeModel.findById(id)
      .populate({
        path: 'userId',
        select: 'email phone role isActive',
      })
      .exec();
    if (!emp) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return emp;
  }

  async update(id: string, updateData: Partial<Employee>): Promise<EmployeeDocument> {
    const emp = await this.employeeModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!emp) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return emp;
  }

  async deactivate(id: string): Promise<EmployeeDocument> {
    const emp = await this.employeeModel.findById(id).exec();
    if (!emp) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    emp.isActive = false;
    
    // Also disable user login
    const user = await this.usersService.findById(emp.userId.toString());
    if (user) {
      user.isActive = false;
      await user.save();
    }

    return emp.save();
  }
}
