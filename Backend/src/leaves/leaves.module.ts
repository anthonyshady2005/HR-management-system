import {forwardRef, Module} from '@nestjs/common';
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
import {
  EmployeeProfile,
  EmployeeProfileSchema,
} from '../employee-profile/models/employee-profile.schema';
import {
  NotificationLog,
  NotificationLogSchema,
} from '../time-management/models/notification-log.schema';
import { Holiday, HolidaySchema } from '../time-management/models/holiday.schema';
import { EmployeeProfileModule } from '../employee-profile/employee-profile.module';
import { TimeManagementModule } from '../time-management/time-management.module';
import { paySlip, paySlipSchema } from '../payroll-execution/models/payslip.schema';
import { employeePayrollDetails, employeePayrollDetailsSchema } from '../payroll-execution/models/employeePayrollDetails.schema';

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
      { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
      { name: NotificationLog.name, schema: NotificationLogSchema },
      { name: Holiday.name, schema: HolidaySchema },
      { name: 'paySlip', schema: paySlipSchema },
      { name: employeePayrollDetails.name, schema: employeePayrollDetailsSchema },
    ]),
    EmployeeProfileModule,
    forwardRef(() => TimeManagementModule),
  ],
  controllers: [LeavesController],
  providers: [LeavesService, LeavesScheduler],
  exports: [LeavesService,
    MongooseModule,
  ],
})
export class LeavesModule {}
