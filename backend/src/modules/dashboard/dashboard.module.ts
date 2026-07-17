import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { ReportsModule } from '../reports/reports.module';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [ReportsModule, EmployeesModule],
  controllers: [DashboardController],
})
export class DashboardModule { }
