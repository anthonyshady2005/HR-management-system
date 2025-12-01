import { Module } from '@nestjs/common';
import { PayrollPayslipViewLogService } from './payroll-payslip-view-log.service';
import { PayrollPayslipViewLogController } from './payroll-payslip-view-log.controller';

@Module({
  providers: [PayrollPayslipViewLogService],
  controllers: [PayrollPayslipViewLogController]
})
export class PayrollPayslipViewLogModule {}
