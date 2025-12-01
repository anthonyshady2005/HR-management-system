import { Module } from '@nestjs/common';
import { PayrollPeriodService } from './payroll-period.service';
import { PayrollPeriodController } from './payroll-period.controller';

@Module({
  controllers: [PayrollPeriodController],
  providers: [PayrollPeriodService],
})
export class PayrollPeriodModule {}
