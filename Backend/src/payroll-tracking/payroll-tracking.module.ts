import { Module } from '@nestjs/common';
import { PayrollTrackingService } from './payroll-tracking.service';
import { PayrollTrackingController } from './payroll-tracking.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { claims, claimsSchema } from './models/claims.schema';
import { disputes, disputesSchema } from './models/disputes.schema';
import { refunds, refundsSchema } from './models/refunds.schema';
import { paySlip, paySlipSchema } from '../payroll-execution/models/payslip.schema';
import { EmployeeProfileSchema } from '../employee-profile/models/employee-profile.schema';
import { NotificationLogSchema } from '../time-management/models/notification-log.schema';
import { EmployeeSystemRoleSchema } from '../employee-profile/models/employee-system-role.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: claims.name, schema: claimsSchema },
      { name: disputes.name, schema: disputesSchema },
      { name: refunds.name, schema: refundsSchema },
      { name: 'paySlip', schema: paySlipSchema },
      { name: 'EmployeeProfile', schema: EmployeeProfileSchema },
      { name: 'NotificationLog', schema: NotificationLogSchema },
      { name: 'EmployeeSystemRole', schema: EmployeeSystemRoleSchema },
    ]),
  ],
  providers: [PayrollTrackingService],
  controllers: [PayrollTrackingController],
})
export class PayrollTrackingModule { }
