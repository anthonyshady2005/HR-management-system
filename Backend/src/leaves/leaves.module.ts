import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Schemas
import { LeaveCategory, LeaveCategorySchema } from './schemas';
import { LeaveType, LeaveTypeSchema } from './schemas';
import { VacationPackage, VacationPackageSchema } from './schemas';
import { EmployeeLeaveBalance, EmployeeLeaveBalanceSchema } from './schemas';
import { LeaveRequest, LeaveRequestSchema } from './schemas';
import { ApprovalWorkflow, ApprovalWorkflowSchema } from './schemas';
import { HolidayCalendar, HolidayCalendarSchema } from './schemas';
import { LeaveBlockPeriod, LeaveBlockPeriodSchema } from './schemas';
import { LeaveAdjustment, LeaveAdjustmentSchema } from './schemas';
import { ManagerDelegation, ManagerDelegationSchema } from './schemas';

// Controller and Service
import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';

// External modules for integration
import { EmployeeModule } from '../employee-profile/employee-profile.module';
import { OrganizationModule } from '../org-structure/org-structure.module';
import { TimeManagementModule } from '../time-management/time-management.module';
import { PayrollModule } from '../payroll/payroll.module';

@Module({
  imports: [
    // Register all Leaves schemas
    MongooseModule.forFeature([
      { name: LeaveCategory.name, schema: LeaveCategorySchema },
      { name: LeaveType.name, schema: LeaveTypeSchema },
      { name: VacationPackage.name, schema: VacationPackageSchema },
      { name: EmployeeLeaveBalance.name, schema: EmployeeLeaveBalanceSchema },
      { name: LeaveRequest.name, schema: LeaveRequestSchema },
      { name: ApprovalWorkflow.name, schema: ApprovalWorkflowSchema },
      { name: HolidayCalendar.name, schema: HolidayCalendarSchema },
      { name: LeaveBlockPeriod.name, schema: LeaveBlockPeriodSchema },
      { name: LeaveAdjustment.name, schema: LeaveAdjustmentSchema },
      { name: ManagerDelegation.name, schema: ManagerDelegationSchema },
    ]),

    // External module dependencies for integration
    EmployeeModule,
    OrganizationModule,
    TimeManagementModule,
    PayrollModule,
  ],
  controllers: [LeavesController],
  providers: [LeavesService],
  exports: [LeavesService],
})
export class LeavesModule {}
