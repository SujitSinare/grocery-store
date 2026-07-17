import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsString()
  @IsOptional()
  storeId?: string;
}

class CreateBrandDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  logo?: string;
}

class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsNotEmpty()
  barcode: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  brandId: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsBoolean()
  @IsOptional()
  isGlobal?: boolean;
}

class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  brandId?: string;

  @IsString()
  @IsOptional()
  image?: string;
}

@ApiTags('Products, Categories, and Brands')
@ApiBearerAuth('JWT-auth')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  // --- Category APIs ---
  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'manager')
  @ApiOperation({ summary: 'Create a new product category (Admin/Manager only)' })
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.productsService.createCategory(dto.name, dto.parentId, dto.storeId);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Retrieve all category trees' })
  async getCategories(@Query('storeId') storeId?: string) {
    return this.productsService.findAllCategories(storeId);
  }

  // --- Brand APIs ---
  @Post('brands')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'manager')
  @ApiOperation({ summary: 'Create a brand catalog entry (Admin/Manager only)' })
  async createBrand(@Body() dto: CreateBrandDto) {
    return this.productsService.createBrand(dto.name, dto.logo);
  }

  @Get('brands')
  @ApiOperation({ summary: 'Retrieve all cataloged brands' })
  async getBrands() {
    return this.productsService.findAllBrands();
  }

  // --- Product APIs ---
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'manager')
  @ApiOperation({ summary: 'Add a new general product definition (Admin/Manager only)' })
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.createProduct(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Search and query the general catalog with limits' })
  async findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
  ) {
    return this.productsService.findAllProducts({ search, categoryId, brandId, limit, skip });
  }

  @Get('barcode/:barcode')
  @ApiOperation({ summary: 'Resolve a product details using a scanned Barcode' })
  async findByBarcode(@Param('barcode') barcode: string) {
    return this.productsService.findByBarcode(barcode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single product information' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'manager')
  @ApiOperation({ summary: 'Modify general product characteristics' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.updateProduct(id, dto);
  }
}
export { CreateCategoryDto, CreateBrandDto, CreateProductDto, UpdateProductDto };
