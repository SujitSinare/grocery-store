import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [ReportsModule],
  controllers: [DashboardController],
})
export class DashboardModule {}
