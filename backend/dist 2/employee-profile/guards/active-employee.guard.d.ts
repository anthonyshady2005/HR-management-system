import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Model } from 'mongoose';
import { EmployeeProfileDocument } from '../models/employee-profile.schema';
export declare class ActiveEmployeeGuard implements CanActivate {
    private readonly profileModel;
    private readonly blockedStatuses;
    constructor(profileModel: Model<EmployeeProfileDocument>);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
