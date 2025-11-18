import { Module } from '@nestjs/common';
import { PayrollDisputeService } from './payroll-dispute.service';
import { PayrollDisputeController } from './payroll-dispute.controller';

@Module({
  providers: [PayrollDisputeService],
  controllers: [PayrollDisputeController]
})
export class PayrollDisputeModule {}
