import { Module } from '@nestjs/common';
import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';
import { LeavesScheduler } from './leaves.scheduler';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { LeaveType, LeaveTypeSchema } from './models/leave-type.schema';
import {
  LeaveRequest,
  LeaveRequestSchema,
} from './models/leave-request.schema';
import { LeavePolicy, LeavePolicySchema } from './models/leave-policy.schema';
import {
  LeaveEntitlement,
  LeaveEntitlementSchema,
} from './models/leave-entitlement.schema';
import {
  LeaveCategory,
  LeaveCategorySchema,
} from './models/leave-category.schema';
import {
  LeaveAdjustment,
  LeaveAdjustmentSchema,
} from './models/leave-adjustment.schema';
import { Calendar, CalendarSchema } from './models/calendar.schema';
import { Attachment, AttachmentSchema } from './models/attachment.schema';
import {
  PositionAssignment,
  PositionAssignmentSchema,
} from '../organization-structure/models/position-assignment.schema';
import { EmployeeProfileModule } from '../employee-profile/employee-profile.module';
import { TimeManagementModule } from '../time-management/time-management.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: LeaveType.name, schema: LeaveTypeSchema },
      { name: LeaveRequest.name, schema: LeaveRequestSchema },
      { name: LeavePolicy.name, schema: LeavePolicySchema },
      { name: LeaveEntitlement.name, schema: LeaveEntitlementSchema },
      { name: LeaveCategory.name, schema: LeaveCategorySchema },
      { name: LeaveAdjustment.name, schema: LeaveAdjustmentSchema },
      { name: Calendar.name, schema: CalendarSchema },
      { name: Attachment.name, schema: AttachmentSchema },
      { name: PositionAssignment.name, schema: PositionAssignmentSchema },
    ]),
    EmployeeProfileModule,
    TimeManagementModule,
  ],
  controllers: [LeavesController],
  providers: [LeavesService, LeavesScheduler],
  exports: [LeavesService],
})
export class LeavesModule {}
