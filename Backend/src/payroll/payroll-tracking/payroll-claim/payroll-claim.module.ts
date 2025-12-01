import { Module } from '@nestjs/common';
import { PayrollClaimService } from './payroll-claim.service';
import { PayrollClaimController } from './payroll-claim.controller';

@Module({
  providers: [PayrollClaimService],
  controllers: [PayrollClaimController]
})
export class PayrollClaimModule {}
