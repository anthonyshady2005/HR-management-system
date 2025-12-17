import { Types } from 'mongoose';
export declare class CreatePositionDto {
    title: string;
    code: string;
    departmentId: Types.ObjectId;
    reportsTo?: Types.ObjectId;
    status: 'active' | 'inactive';
}
