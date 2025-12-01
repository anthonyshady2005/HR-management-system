import { Test, TestingModule } from '@nestjs/testing';
import { PayrollPolicyService } from './payroll-policy.service';

describe('PayrollPolicyService', () => {
  let service: PayrollPolicyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PayrollPolicyService],
    }).compile();

    service = module.get<PayrollPolicyService>(PayrollPolicyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
