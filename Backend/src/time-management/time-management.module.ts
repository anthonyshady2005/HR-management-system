import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TimeManagementController } from './time-management.controller';
import { TimeManagementService } from './time-management.service';

// Models (Schemas)
import { AttendanceRecord, AttendanceRecordSchema } from './models/attendance-record.schema';
import { ShiftAssignment, ShiftAssignmentSchema } from './models/shift-assignment.schema';
import { Shift, ShiftSchema } from './models/shift.schema';
import { ShiftType, ShiftTypeSchema } from './models/shift-type.schema';
import { TimeException, TimeExceptionSchema } from './models/time-exception.schema';
import { LatenessRule, latenessRuleSchema } from './models/lateness-rule.schema';
import { OvertimeRule, OvertimeRuleSchema } from './models/overtime-rule.schema';
import { Holiday, HolidaySchema } from './models/holiday.schema';
import { ScheduleRule, ScheduleRuleSchema } from './models/schedule-rule.schema';
import { AttendanceCorrectionRequest, AttendanceCorrectionRequestSchema } from './models/attendance-correction-request.schema';
import { NotificationLog, NotificationLogSchema } from './models/notification-log.schema';

// External modules
import { EmployeeProfileModule } from '../employee-profile/employee-profile.module';
import { LeavesModule } from '../leaves/leaves.module';
import { PayrollTrackingModule } from '../payroll-tracking/payroll-tracking.module';
import { OrganizationStructureModule } from '../organization-structure/organization-structure.module';

@Module({
  imports: [
    // Register all Time Management Schemas
    MongooseModule.forFeature([
      { name: AttendanceRecord.name, schema: AttendanceRecordSchema },
      { name: ShiftAssignment.name, schema: ShiftAssignmentSchema },
      { name: Shift.name, schema: ShiftSchema },
      { name: ShiftType.name, schema: ShiftTypeSchema },
      { name: TimeException.name, schema: TimeExceptionSchema },
      { name: LatenessRule.name, schema: latenessRuleSchema },
      { name: OvertimeRule.name, schema: OvertimeRuleSchema },
      { name: Holiday.name, schema: HolidaySchema },
      { name: ScheduleRule.name, schema: ScheduleRuleSchema },
      { name: AttendanceCorrectionRequest.name, schema: AttendanceCorrectionRequestSchema },
      { name: NotificationLog.name, schema: NotificationLogSchema },
    ]),

    // External Modules (safe)
    EmployeeProfileModule,

    // Critical: solve circular dependency
    forwardRef(() => LeavesModule),

    PayrollTrackingModule,
    OrganizationStructureModule,
  ],

  controllers: [TimeManagementController],

  providers: [
    TimeManagementService,
  ],

  exports: [
    TimeManagementService,
  ],
})
export class TimeManagementModule {}
