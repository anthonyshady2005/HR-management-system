import { Test, TestingModule } from '@nestjs/testing';
import { PayrollReportController } from './payroll-report.controller';

describe('PayrollReportController', () => {
  let controller: PayrollReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollReportController],
    }).compile();

    controller = module.get<PayrollReportController>(PayrollReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
