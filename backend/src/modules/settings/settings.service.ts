import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Settings, SettingsDocument } from './schemas/settings.schema';

@Injectable()
export class SettingsService {
  constructor(@InjectModel(Settings.name) private settingsModel: Model<SettingsDocument>) {}

  async getSetting(key: string, storeId?: string): Promise<any> {
    const sId = storeId ? new Types.ObjectId(storeId) : null;
    const setting = await this.settingsModel.findOne({ storeId: sId, key }).exec();
    if (!setting && storeId) {
      // Fallback to global setting if store override doesn't exist
      return this.settingsModel.findOne({ storeId: null, key }).exec();
    }
    return setting;
  }

  async saveSetting(key: string, value: Record<string, any>, storeId?: string): Promise<SettingsDocument> {
    const sId = storeId ? new Types.ObjectId(storeId) : null;
    const existing = await this.settingsModel.findOne({ storeId: sId, key }).exec();
    
    if (existing) {
      existing.value = value;
      return existing.save();
    }

    const setting = new this.settingsModel({
      storeId: sId,
      key,
      value,
    });
    return setting.save();
  }
}
export { SettingsService };
