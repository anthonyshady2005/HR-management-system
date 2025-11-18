import { Controller } from '@nestjs/common';
import { PayrollPeriodService } from './payroll-period.service';

@Controller('payroll-period')
export class PayrollPeriodController {
  constructor(private readonly payrollPeriodService: PayrollPeriodService) {}
}
