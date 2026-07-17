import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/core';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ROLES_KEY } from './roles.decorator';
import { Employee, EmployeeDocument } from '../employees/schemas/employee.schema';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      return false;
    }

    // Super Admin has global master access
    if (user.role === 'super-admin') {
      return true;
    }

    // Check basic user roles (super-admin, customer)
    if (requiredRoles.includes(user.role)) {
      return true;
    }

    // If manager/worker roles are required, check employee record
    if (user.role === 'employee') {
      const storeId = request.headers['x-store-id'] || request.query.storeId || request.params.storeId;
      
      if (!storeId) {
        // If no store context, check if we just require general 'employee'
        if (requiredRoles.includes('employee')) {
          return true;
        }
        throw new ForbiddenException('Store context (X-Store-ID header or storeId) is required for employee access');
      }

      const employee = await this.employeeModel.findOne({
        userId: user.id,
        storeId: storeId,
        isActive: true,
      }).exec();

      if (!employee) {
        throw new ForbiddenException('Employee record not found or inactive for this store');
      }

      // Store employee profile in request for downstream use in controllers
      request.employee = employee;

      // Check specific employee roles:
      // - manager: only 'manager' role satisfies
      // - worker: both 'worker' and 'manager' satisfy
      if (requiredRoles.includes('manager') && employee.role === 'manager') {
        return true;
      }
      
      if (requiredRoles.includes('worker') && (employee.role === 'worker' || employee.role === 'manager')) {
        return true;
      }
    }

    return false;
  }
}
