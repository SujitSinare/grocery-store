import { Controller, Get, Post, Patch, Param, Body, Query, Headers, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

class AddOrUpdateInventoryDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsOptional()
  openingStock?: number;

  @IsNumber()
  @IsOptional()
  currentStock?: number;

  @IsNumber()
  @IsOptional()
  minStock?: number;

  @IsNumber()
  @IsOptional()
  maxStock?: number;

  @IsNumber()
  @IsOptional()
  purchasePrice?: number;

  @IsNumber()
  @IsOptional()
  sellingPrice?: number;

  @IsNumber()
  @IsOptional()
  mrp?: number;

  @IsNumber()
  @IsOptional()
  gstRate?: number;

  @IsString()
  @IsOptional()
  batchNumber?: string;

  @IsString()
  @IsOptional()
  supplierId?: string;
}

class AdjustStockDto {
  @IsNumber()
  @IsNotEmpty()
  qty: number; // e.g. +10 or -5

  @IsString()
  @IsNotEmpty()
  reason: string;
}

@ApiTags('Inventory Management')
@ApiBearerAuth('JWT-auth')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Post()
  @Roles('manager', 'worker')
  @ApiOperation({ summary: 'Add or update catalog item stock details (Manager/Worker)' })
  async addOrUpdate(
    @Headers('x-store-id') storeId: string,
    @Body() dto: AddOrUpdateInventoryDto,
  ) {
    const { productId, ...data } = dto;
    return this.inventoryService.addOrUpdate(storeId, productId, data);
  }

  @Get()
  @Roles('manager', 'worker')
  @ApiOperation({ summary: 'Retrieve store-scoped stock metrics with filtering' })
  async getStoreInventory(
    @Headers('x-store-id') storeId: string,
    @Query('lowStockOnly') lowStockOnly?: boolean,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
  ) {
    return this.inventoryService.findStoreInventory(storeId, { lowStockOnly, search, limit, skip });
  }

  @Get(':productId')
  @Roles('manager', 'worker')
  @ApiOperation({ summary: 'Retrieve store-scoped stock levels for a specific product ID' })
  async getOne(
    @Headers('x-store-id') storeId: string,
    @Param('productId') productId: string,
  ) {
    return this.inventoryService.findOne(storeId, productId);
  }

  @Patch(':productId/adjust')
  @Roles('manager', 'worker')
  @ApiOperation({ summary: 'Perform manual stock adjustments due to sales, damages, or audits' })
  async adjustStock(
    @Headers('x-store-id') storeId: string,
    @Param('productId') productId: string,
    @Body() dto: AdjustStockDto,
  ) {
    return this.inventoryService.adjustStock(storeId, productId, dto.qty, dto.reason);
  }
}
export { AddOrUpdateInventoryDto, AdjustStockDto };
