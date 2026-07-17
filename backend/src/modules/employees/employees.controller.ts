import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Headers } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { IsNotEmpty, IsString, IsNumber, IsEmail, IsOptional } from 'class-validator';

class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  storeId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  role: string; // 'manager' | 'worker'

  @IsNumber()
  @IsNotEmpty()
  salary: number;
}

class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsNumber()
  @IsOptional()
  salary?: number;
}

@ApiTags('Employees Management')
@ApiBearerAuth('JWT-auth')
@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private employeesService: EmployeesService) {}

  @Post()
  @Roles('super-admin', 'manager')
  @ApiOperation({ summary: 'Register a new employee for a store (Admin/Manager only)' })
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @Roles('super-admin', 'manager')
  @ApiOperation({ summary: 'List all employees for a specific store (Admin/Manager only)' })
  async findAll(@Headers('x-store-id') storeIdHeader: string, @Query('storeId') storeIdQuery: string) {
    const storeId = storeIdHeader || storeIdQuery;
    return this.employeesService.findAllByStore(storeId);
  }

  @Get(':id')
  @Roles('super-admin', 'manager')
  @ApiOperation({ summary: 'Get employee profile details' })
  async findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Put(':id')
  @Roles('super-admin', 'manager')
  @ApiOperation({ summary: 'Modify employee parameters' })
  async update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id/deactivate')
  @Roles('super-admin', 'manager')
  @ApiOperation({ summary: 'Deactivate an employee and revoke login permissions' })
  async deactivate(@Param('id') id: string) {
    return this.employeesService.deactivate(id);
  }
}
export { CreateEmployeeDto, UpdateEmployeeDto };
