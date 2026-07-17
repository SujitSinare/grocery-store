import { Controller, Get, Post, Param, Body, Headers, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { IsNotEmpty, IsString, IsArray, IsOptional, ArrayNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNotEmpty()
  qty: number;
}

class CreateOrderDto {
  @IsString()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsNotEmpty()
  orderType: string; // 'pos' | 'online'

  @IsString()
  @IsOptional()
  employeeId?: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string; // 'cash' | 'upi' | 'card'

  @IsString()
  @IsOptional()
  couponCode?: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

@ApiTags('Orders and POS Checkout')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @Roles('manager', 'worker', 'customer')
  @ApiOperation({ summary: 'Submit a new checkout basket order (POS or Customer Storefront)' })
  async createOrder(
    @Headers('x-store-id') storeId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(storeId, dto);
  }

  @Get()
  @Roles('manager', 'worker')
  @ApiOperation({ summary: 'List all historical store-scoped sales records' })
  async getStoreOrders(@Headers('x-store-id') storeId: string) {
    return this.ordersService.findAllByStore(storeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve itemized sales logs for a single order ID' })
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }
}
export { CreateOrderDto, OrderItemDto };
