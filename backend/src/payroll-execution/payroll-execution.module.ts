import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PayrollExecutionController } from './payroll-execution.controller';
import { PayrollExecutionService } from './payroll-execution.service';
import {
  terminationAndResignationBenefits,
  terminationAndResignationBenefitsSchema,
} from '../payroll-configuration/models/terminationAndResignationBenefits';
import {
  signingBonus,
  signingBonusSchema,
} from '../payroll-configuration/models/signingBonus.schema';
import {
  EmployeeTerminationResignation,
  EmployeeTerminationResignationSchema,
} from './models/EmployeeTerminationResignation.schema';
import {
  employeePayrollDetails,
  employeePayrollDetailsSchema,
} from './models/employeePayrollDetails.schema';
import {
  employeePenalties,
  employeePenaltiesSchema,
} from './models/employeePenalties.schema';
import {
  employeeSigningBonus,
  employeeSigningBonusSchema,
} from './models/EmployeeSigningBonus.schema';
import { payrollRuns, payrollRunsSchema } from './models/payrollRuns.schema';
import { paySlip, paySlipSchema } from './models/payslip.schema';
import { PayrollTrackingModule } from '../payroll-tracking/payroll-tracking.module';
import { PayrollConfigurationModule } from '../payroll-configuration/payroll-configuration.module';
import { TimeManagementModule } from '../time-management/time-management.module';
import { EmployeeProfileModule } from '../employee-profile/employee-profile.module';
import { LeavesModule } from '../leaves/leaves.module';

// Import models from other subsystems
import {
  EmployeeProfile,
  EmployeeProfileSchema,
} from '../employee-profile/models/employee-profile.schema';
import {
  taxRules,
  taxRulesSchema,
} from '../payroll-configuration/models/taxRules.schema';
import {
  insuranceBrackets,
  insuranceBracketsSchema,
} from '../payroll-configuration/models/insuranceBrackets.schema';
import {
  payGrade,
  payGradeSchema,
} from '../payroll-configuration/models/payGrades.schema';
import {
  allowance,
  allowanceSchema,
} from '../payroll-configuration/models/allowance.schema';
import {
  refunds,
  refundsSchema,
} from '../payroll-tracking/models/refunds.schema';
import {
  AttendanceRecord,
  AttendanceRecordSchema,
} from '../time-management/models/attendance-record.schema';
import {
  LeaveRequest,
  LeaveRequestSchema,
} from '../leaves/models/leave-request.schema';
import { LeaveType, LeaveTypeSchema } from '../leaves/models/leave-type.schema';
import {
  Position,
  PositionSchema,
} from '../organization-structure/models/position.schema';
import {
  Department,
  DepartmentSchema,
} from '../organization-structure/models/department.schema';

@Module({
  imports: [
    forwardRef(() => PayrollTrackingModule),
    PayrollConfigurationModule,
    TimeManagementModule,
    EmployeeProfileModule,
    LeavesModule,
    MongooseModule.forFeature([
      // Payroll Execution Models
      { name: payrollRuns.name, schema: payrollRunsSchema },
      { name: paySlip.name, schema: paySlipSchema },
      {
        name: employeePayrollDetails.name,
        schema: employeePayrollDetailsSchema,
      },
      { name: employeeSigningBonus.name, schema: employeeSigningBonusSchema },
      {
        name: EmployeeTerminationResignation.name,
        schema: EmployeeTerminationResignationSchema,
      },
      {
        name: terminationAndResignationBenefits.name,
        schema: terminationAndResignationBenefitsSchema,
      },
      { name: employeePenalties.name, schema: employeePenaltiesSchema },
      { name: signingBonus.name, schema: signingBonusSchema },

      // Models from other subsystems (registered here to inject directly)
      { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
      { name: taxRules.name, schema: taxRulesSchema },
      { name: insuranceBrackets.name, schema: insuranceBracketsSchema },
      { name: payGrade.name, schema: payGradeSchema },
      { name: allowance.name, schema: allowanceSchema },
      { name: refunds.name, schema: refundsSchema },
      { name: AttendanceRecord.name, schema: AttendanceRecordSchema },
      { name: LeaveRequest.name, schema: LeaveRequestSchema },
      { name: LeaveType.name, schema: LeaveTypeSchema },
      { name: Position.name, schema: PositionSchema },
      { name: Department.name, schema: DepartmentSchema },
    ]),
  ],
  controllers: [PayrollExecutionController],
  providers: [PayrollExecutionService],
  exports: [PayrollExecutionService],
})
export class PayrollExecutionModule {}
