import { Controller, Get, Post, Put, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { StoresService } from './stores.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsObject } from 'class-validator';

class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  gstNumber: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
}

class UpdateStoreDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
}

class SetManagerDto {
  @IsString()
  @IsNotEmpty()
  managerId: string;
}

class SetStatusDto {
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}

@ApiTags('Stores Management')
@ApiBearerAuth('JWT-auth')
@Controller('stores')
export class StoresController {
  constructor(private storesService: StoresService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin')
  @ApiOperation({ summary: 'Create a new tenant store location (Super Admin only)' })
  async create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin')
  @ApiOperation({ summary: 'Retrieve all store registers (Super Admin only)' })
  async findAll() {
    return this.storesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Retrieve a single store details' })
  async findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin')
  @ApiOperation({ summary: 'Update physical store parameters (Super Admin only)' })
  async update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storesService.update(id, updateStoreDto);
  }

  @Patch(':id/manager')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin')
  @ApiOperation({ summary: 'Assign or transfer manager roles for a store location (Super Admin only)' })
  async setManager(@Param('id') id: string, @Body() setManagerDto: SetManagerDto) {
    return this.storesService.setManager(id, setManagerDto.managerId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin')
  @ApiOperation({ summary: 'Enable or disable store tenants (Super Admin only)' })
  async setStatus(@Param('id') id: string, @Body() setStatusDto: SetStatusDto) {
    return this.storesService.setStatus(id, setStatusDto.isActive);
  }
}
export { CreateStoreDto, UpdateStoreDto, SetManagerDto, SetStatusDto };
