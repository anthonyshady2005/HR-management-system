import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  StructureChangeLog,
  StructureChangeLogDocument,
} from './models/structure-change-log.schema';
import { ChangeLogAction } from './enums/organization-structure.enums';

@Injectable()
export class StructureChangeLogService {
  constructor(
    @InjectModel(StructureChangeLog.name)
    private changeLogModel: Model<StructureChangeLogDocument>,
  ) {}

  async logChange(
    action: ChangeLogAction,
    entityType: string,
    entityId: Types.ObjectId,
    beforeSnapshot: Record<string, unknown> | null,
    afterSnapshot: Record<string, unknown> | null,
    performedByEmployeeId?: Types.ObjectId,
    summary?: string,
  ): Promise<StructureChangeLogDocument> {
    const logEntry = new this.changeLogModel({
      action,
      entityType,
      entityId,
      beforeSnapshot,
      afterSnapshot,
      performedByEmployeeId,
      summary,
    });

    return await logEntry.save();
  }
}

