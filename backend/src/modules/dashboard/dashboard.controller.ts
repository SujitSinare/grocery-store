import { Controller, Get, Headers, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from '../reports/reports.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Dashboard Metrics')
@ApiBearerAuth('JWT-auth')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private reportsService: ReportsService) {}

  @Get('summary')
  @Roles('super-admin', 'manager', 'worker')
  @ApiOperation({ summary: 'Retrieve store sales, charts, metrics, and stock warnings (Cashier/Manager)' })
  async getDashboardSummary(@Headers('x-store-id') storeId: string, @Query('storeId') storeIdQuery: string) {
    const sId = storeId || storeIdQuery;
    return this.reportsService.getDashboardSummary(sId);
  }
}
