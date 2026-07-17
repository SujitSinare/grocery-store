import { Controller, Get, Headers, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Analytics and Reports Exporter')
@ApiBearerAuth('JWT-auth')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('dashboard')
  @Roles('super-admin', 'manager')
  @ApiOperation({ summary: 'Retrieve dashboard metrics, charts, and recent transaction history' })
  async getDashboardSummary(@Headers('x-store-id') storeId: string, @Query('storeId') storeIdQuery: string) {
    const sId = storeId || storeIdQuery;
    return this.reportsService.getDashboardSummary(sId);
  }

  @Get('export/excel')
  @Roles('super-admin', 'manager')
  @ApiOperation({ summary: 'Compile and download sales & stock spreadsheets (Excel format)' })
  async exportExcel(@Headers('x-store-id') storeId: string, @Query('storeId') storeIdQuery: string) {
    const sId = storeId || storeIdQuery;
    const url = await this.reportsService.generateExcelReport(sId);
    return { downloadUrl: url };
  }

  @Get('export/pdf')
  @Roles('super-admin', 'manager')
  @ApiOperation({ summary: 'Compile and download store performance summary (PDF format)' })
  async exportPdf(@Headers('x-store-id') storeId: string, @Query('storeId') storeIdQuery: string) {
    const sId = storeId || storeIdQuery;
    const url = await this.reportsService.generatePdfReport(sId);
    return { downloadUrl: url };
  }
}
