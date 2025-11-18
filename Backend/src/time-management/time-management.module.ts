import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// ---- IMPORT OTHER MODULES ----
import { EmployeeModule } from '../employee-profile/employee-profile.module';
import { PayrollModule } from '../payroll/payroll.module';
import { LeavesModule } from 'src/leaves/leaves.module';  
// ---- IMPORT ALL 19 SCHEMAS ----
import { AttendanceCorrectionRequest, AttendanceCorrectionRequestSchema } from './schemas/attendance-correction-request.schema';
import { AttendanceExceptionReport, AttendanceExceptionReportSchema } from './schemas/attendance-exception-report.schema';
import { Attendance, AttendanceSchema } from './schemas/attendance.schema';

import { EmployeeLatenessLog, EmployeeLatenessLogSchema } from './schemas/employee-lateness-log.schema';
import { EmployeeLeaveAllocationLink, EmployeeLeaveAllocationLinkSchema } from './schemas/employee-leave-allocation-link.schema';

import { ExceptionEscalationRule, ExceptionEscalationRuleSchema } from './schemas/exception-escalation-rule.schema';
import { Holiday, HolidaySchema } from './schemas/holiday.schema';
import { LatenessRule, LatenessRuleSchema } from './schemas/lateness-rules.schema';
import { ManualCorrectionLog, ManualCorrectionLogSchema } from './schemas/manual-correction-log.schema';

import { PayrollEscalation, PayrollEscalationSchema } from './schemas/payroll-escalation.schema';
import { PayrollSyncLog, PayrollSyncLogSchema } from './schemas/payroll-sync-log.schema';

import { PunchCorrectionRequest, PunchCorrectionRequestSchema } from './schemas/punch-correction-request.schema';
import { Punch, PunchSchema } from './schemas/punch.schema';

import { SchedulingRule, SchedulingRuleSchema } from './schemas/scheduling-rule.schema';
import { ShiftAssignment, ShiftAssignmentSchema } from './schemas/shift-assignment.schema';
import { ShiftType, ShiftTypeSchema } from './schemas/shift-type.schema';

import { TimeExceptionApprovalLog, TimeExceptionApprovalLogSchema } from './schemas/time-exception-approval-log.schema';
import { TimeExceptionRequest, TimeExceptionRequestSchema } from './schemas/time-exception-request.schema';

import { WorkPolicy, WorkPolicySchema } from './schemas/work-polices.schema';
import { TimeManagementService } from './time-management.service';
import { TimeManagementController } from './time-management.controller';

@Module({
  imports: [
    // Import other subsystem modules
    EmployeeModule,
    PayrollModule,
    LeavesModule,
    
    // Import schemas for this module
    MongooseModule.forFeature([
      { name: AttendanceCorrectionRequest.name, schema: AttendanceCorrectionRequestSchema },
      { name: AttendanceExceptionReport.name, schema: AttendanceExceptionReportSchema },
      { name: Attendance.name, schema: AttendanceSchema },

      { name: EmployeeLatenessLog.name, schema: EmployeeLatenessLogSchema },
      { name: EmployeeLeaveAllocationLink.name, schema: EmployeeLeaveAllocationLinkSchema },

      { name: ExceptionEscalationRule.name, schema: ExceptionEscalationRuleSchema },
      { name: Holiday.name, schema: HolidaySchema },
      { name: LatenessRule.name, schema: LatenessRuleSchema },
      { name: ManualCorrectionLog.name, schema: ManualCorrectionLogSchema },

      { name: PayrollEscalation.name, schema: PayrollEscalationSchema },
      { name: PayrollSyncLog.name, schema: PayrollSyncLogSchema },

      { name: PunchCorrectionRequest.name, schema: PunchCorrectionRequestSchema },
      { name: Punch.name, schema: PunchSchema },

      { name: SchedulingRule.name, schema: SchedulingRuleSchema },
      { name: ShiftAssignment.name, schema: ShiftAssignmentSchema },
      { name: ShiftType.name, schema: ShiftTypeSchema },

      { name: TimeExceptionApprovalLog.name, schema: TimeExceptionApprovalLogSchema },
      { name: TimeExceptionRequest.name, schema: TimeExceptionRequestSchema },

      { name: WorkPolicy.name, schema: WorkPolicySchema },
    ]),
  ],
  controllers: [TimeManagementController],
  providers: [TimeManagementService],
  exports: [TimeManagementModule],
})
export class TimeManagementModule {}