import { Test, TestingModule } from '@nestjs/testing';
import { PayrollReportService } from './payroll-report.service';

describe('PayrollReportService', () => {
  let service: PayrollReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PayrollReportService],
    }).compile();

    service = module.get<PayrollReportService>(PayrollReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
