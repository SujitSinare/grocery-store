import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { EmployeesModule } from '../employees/employees.module';

@Global() // Make Auth, Guards, and Strategy accessible globally without repeating imports
@Module({
  imports: [
    UsersModule,
    EmployeesModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  providers: [AuthService, JwtStrategy, RolesGuard, JwtAuthGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy, RolesGuard, JwtAuthGuard, PassportModule, JwtModule],
})
export class AuthModule {}
