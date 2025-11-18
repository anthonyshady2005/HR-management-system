import { Test, TestingModule } from '@nestjs/testing';
import { PayrollPayslipViewLogController } from './payroll-payslip-view-log.controller';

describe('PayrollPayslipViewLogController', () => {
  let controller: PayrollPayslipViewLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollPayslipViewLogController],
    }).compile();

    controller = module.get<PayrollPayslipViewLogController>(PayrollPayslipViewLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
