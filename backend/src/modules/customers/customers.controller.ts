import { Controller, Get, Post, Param, Body, Headers, Query, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsNotEmpty, IsString, IsOptional, IsEmail, IsObject } from 'class-validator';

class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}

class AddAddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  zipCode: string;
}

@ApiTags('Customers Management')
@ApiBearerAuth('JWT-auth')
@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new customer shopper' })
  async create(@Headers('x-store-id') storeId: string, @Body() dto: CreateCustomerDto) {
    return this.customersService.create(storeId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all store-registered customer directories' })
  async findAll(@Headers('x-store-id') storeId: string) {
    return this.customersService.findAllByStore(storeId);
  }

  @Get('phone/:phone')
  @ApiOperation({ summary: 'Look up a customer profile by phone number (for billing)' })
  async findByPhone(@Param('phone') phone: string, @Headers('x-store-id') storeId: string) {
    return this.customersService.findByPhone(phone, storeId);
  }

  @Post(':id/address')
  @ApiOperation({ summary: 'Add a new shipping/billing address to customer profile' })
  async addAddress(@Param('id') id: string, @Body() dto: AddAddressDto) {
    return this.customersService.addAddress(id, dto);
  }
}
export { CreateCustomerDto, AddAddressDto };
