import { Module } from '@nestjs/common';
import { PayrollReportService } from './payroll-report.service';
import { PayrollReportController } from './payroll-report.controller';

@Module({
  providers: [PayrollReportService],
  controllers: [PayrollReportController]
})
export class PayrollReportModule {}
