import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';

// Import all required schemas for seeding
import { User, UserSchema } from '../users/schemas/user.schema';
import { Store, StoreSchema } from '../stores/schemas/store.schema';
import { Employee, EmployeeSchema } from '../employees/schemas/employee.schema';
import { Category, CategorySchema } from '../products/schemas/category.schema';
import { Brand, BrandSchema } from '../products/schemas/brand.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Inventory, InventorySchema } from '../inventory/schemas/inventory.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Store.name, schema: StoreSchema },
      { name: Employee.name, schema: EmployeeSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Brand.name, schema: BrandSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Inventory.name, schema: InventorySchema },
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
