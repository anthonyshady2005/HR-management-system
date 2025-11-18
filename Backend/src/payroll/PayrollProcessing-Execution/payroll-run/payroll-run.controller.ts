import { Controller } from '@nestjs/common';
import { PayrollRunService } from './payroll-run.service';

@Controller('payroll-run')
export class PayrollRunController {
  constructor(private readonly payrollRunService: PayrollRunService) {}
}
