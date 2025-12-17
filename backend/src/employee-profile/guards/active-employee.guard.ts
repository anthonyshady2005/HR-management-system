/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EmployeeProfile,
  EmployeeProfileDocument,
} from '../models/employee-profile.schema';
import { EmployeeStatus } from '../enums/employee-profile.enums';

// Blocks self-service actions for employees whose status removes normal system access
// (TERMINATED, SUSPENDED, INACTIVE, RETIRED) while allowing HR administrative overrides.
@Injectable()
export class ActiveEmployeeGuard implements CanActivate {
  private readonly blockedStatuses = new Set([
    EmployeeStatus.TERMINATED,
    EmployeeStatus.SUSPENDED,
    EmployeeStatus.INACTIVE,
    EmployeeStatus.RETIRED,
  ]);

  constructor(
    @InjectModel(EmployeeProfile.name)
    private readonly profileModel: Model<EmployeeProfileDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const userId: string | undefined = req.user?.sub;
    if (!userId) {
      throw new ForbiddenException('Missing authenticated user context');
    }

    const profile = await this.profileModel
      .findById(userId)
      .select('status')
      .lean()
      .exec();

    if (!profile) {
      throw new NotFoundException('Employee profile not found');
    }

    if (this.blockedStatuses.has(profile.status)) {
      throw new ForbiddenException(
        `Access denied for status '${profile.status}'. Contact HR for assistance.`,
      );
    }

    return true;
  }
}
