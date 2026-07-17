import { Controller, Get, Post, Put, Delete, Param, Body, Headers, UseGuards } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

class CreateSupplierDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  contactPerson?: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  gstNumber?: string;
}

@ApiTags('Suppliers Management')
@ApiBearerAuth('JWT-auth')
@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Post()
  @Roles('manager')
  @ApiOperation({ summary: 'Register a new supplier for this store' })
  async create(@Headers('x-store-id') storeId: string, @Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(storeId, dto);
  }

  @Get()
  @Roles('manager', 'worker')
  @ApiOperation({ summary: 'List all registered store suppliers' })
  async findAll(@Headers('x-store-id') storeId: string) {
    return this.suppliersService.findAllByStore(storeId);
  }

  @Get(':id')
  @Roles('manager', 'worker')
  @ApiOperation({ summary: 'Get details of a single supplier' })
  async findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Put(':id')
  @Roles('manager')
  @ApiOperation({ summary: 'Update supplier details' })
  async update(@Param('id') id: string, @Body() dto: CreateSupplierDto) {
    return this.suppliersService.update(id, dto);
  }

  @Delete(':id')
  @Roles('manager')
  @ApiOperation({ summary: 'Remove a supplier from directory list' })
  async delete(@Param('id') id: string) {
    return this.suppliersService.delete(id);
  }
}
export { CreateSupplierDto };
