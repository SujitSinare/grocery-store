import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

@Injectable()
export class AuditLogsService {
  constructor(@InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>) {}

  async log(userId: string | null, action: string, details: Record<string, any>, ipAddress?: string): Promise<AuditLogDocument> {
    const logEntry = new this.auditLogModel({
      userId: userId ? new Types.ObjectId(userId) : null,
      action,
      details,
      ipAddress,
    });
    return logEntry.save();
  }

  async findAll(storeId?: string): Promise<AuditLogDocument[]> {
    // If storeId is provided, we filter logs that belong to that store context (e.g. details.storeId = storeId)
    const filter: any = {};
    if (storeId) {
      filter['details.storeId'] = storeId;
    }
    return this.auditLogModel.find(filter)
      .populate('userId', 'email role')
      .sort({ timestamp: -1 })
      .limit(100)
      .exec();
  }
}
export { AuditLogsService };
