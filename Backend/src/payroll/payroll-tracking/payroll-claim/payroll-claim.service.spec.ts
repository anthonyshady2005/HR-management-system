import { Test, TestingModule } from '@nestjs/testing';
import { PayrollClaimService } from './payroll-claim.service';

describe('PayrollClaimService', () => {
  let service: PayrollClaimService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PayrollClaimService],
    }).compile();

    service = module.get<PayrollClaimService>(PayrollClaimService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
