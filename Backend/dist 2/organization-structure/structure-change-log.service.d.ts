import { Model, Types } from 'mongoose';
import { StructureChangeLogDocument } from './models/structure-change-log.schema';
import { ChangeLogAction } from './enums/organization-structure.enums';
export declare class StructureChangeLogService {
    private changeLogModel;
    constructor(changeLogModel: Model<StructureChangeLogDocument>);
    logChange(action: ChangeLogAction, entityType: string, entityId: Types.ObjectId, beforeSnapshot: Record<string, unknown> | null, afterSnapshot: Record<string, unknown> | null, performedByEmployeeId?: Types.ObjectId, summary?: string): Promise<StructureChangeLogDocument>;
}
