import { Controller, Get, Post, Param, Body, Headers, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { IsNotEmpty, IsString, IsObject } from 'class-validator';

class SaveSettingDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsObject()
  @IsNotEmpty()
  value: Record<string, any>;
}

@ApiTags('Settings Configuration')
@ApiBearerAuth('JWT-auth')
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get(':key')
  @ApiOperation({ summary: 'Get configuration settings by key' })
  async getSetting(@Param('key') key: string, @Headers('x-store-id') storeId: string) {
    return this.settingsService.getSetting(key, storeId);
  }

  @Post()
  @Roles('super-admin', 'manager')
  @ApiOperation({ summary: 'Save/override configuration parameters (Admin/Manager only)' })
  async saveSetting(@Headers('x-store-id') storeId: string, @Body() dto: SaveSettingDto) {
    return this.settingsService.saveSetting(dto.key, dto.value, storeId);
  }
}
export { SaveSettingDto };
