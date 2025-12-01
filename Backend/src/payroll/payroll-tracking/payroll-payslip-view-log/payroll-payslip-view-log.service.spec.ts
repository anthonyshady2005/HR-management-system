import { Test, TestingModule } from '@nestjs/testing';
import { PayrollPayslipViewLogService } from './payroll-payslip-view-log.service';

describe('PayrollPayslipViewLogService', () => {
  let service: PayrollPayslipViewLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PayrollPayslipViewLogService],
    }).compile();

    service = module.get<PayrollPayslipViewLogService>(PayrollPayslipViewLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
