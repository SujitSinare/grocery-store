import { Controller, Get, Query, Headers, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('System Audit Logs')
@ApiBearerAuth('JWT-auth')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogsController {
  constructor(private auditLogsService: AuditLogsService) {}

  @Get()
  @Roles('super-admin', 'manager')
  @ApiOperation({ summary: 'View action trails (Admin/Manager only)' })
  async findAll(@Headers('x-store-id') storeId: string, @Query('storeId') storeIdQuery: string) {
    const sId = storeId || storeIdQuery;
    return this.auditLogsService.findAll(sId);
  }
}
