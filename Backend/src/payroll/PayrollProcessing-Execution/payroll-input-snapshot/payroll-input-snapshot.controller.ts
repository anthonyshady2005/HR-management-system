import { Controller } from '@nestjs/common';
import { PayrollInputSnapshotService } from './payroll-input-snapshot.service';

@Controller('payroll-input-snapshot')
export class PayrollInputSnapshotController {
  constructor(private readonly payrollInputSnapshotService: PayrollInputSnapshotService) {}
}
