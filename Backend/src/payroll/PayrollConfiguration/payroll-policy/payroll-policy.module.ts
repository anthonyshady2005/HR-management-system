import { Module } from '@nestjs/common';
import { PayrollPolicyController } from './payroll-policy.controller';
import { PayrollPolicyService } from './payroll-policy.service';

@Module({
  controllers: [PayrollPolicyController],
  providers: [PayrollPolicyService]
})
export class PayrollPolicyModule {}
