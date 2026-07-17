import { Controller, Get, Post, Delete, Param, Body, Headers, Request, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  category: string; // 'rent' | 'salaries' | 'utilities' | 'purchases' | 'maintenance' | 'other'
}

@ApiTags('Store Expenses Management')
@ApiBearerAuth('JWT-auth')
@Controller('expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  @Post()
  @Roles('manager', 'worker')
  @ApiOperation({ summary: 'Log a new store expenditure (Manager/Worker)' })
  async create(
    @Headers('x-store-id') storeId: string,
    @Request() req: any,
    @Body() dto: CreateExpenseDto,
  ) {
    const employeeId = req.employee?._id || req.user.id; // Fallback to user ID if no employee object is injected
    return this.expensesService.create(storeId, employeeId, dto);
  }

  @Get()
  @Roles('manager', 'worker')
  @ApiOperation({ summary: 'View all logged expenditures for the store' })
  async findAll(@Headers('x-store-id') storeId: string) {
    return this.expensesService.findAllByStore(storeId);
  }

  @Delete(':id')
  @Roles('manager')
  @ApiOperation({ summary: 'Remove a logged expense register (Manager only)' })
  async delete(@Param('id') id: string) {
    return this.expensesService.delete(id);
  }
}
export { CreateExpenseDto };
