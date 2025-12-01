import { Test, TestingModule } from '@nestjs/testing';
import { PayrollPeriodController } from './payroll-period.controller';
import { PayrollPeriodService } from './payroll-period.service';

describe('PayrollPeriodController', () => {
  let controller: PayrollPeriodController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollPeriodController],
      providers: [PayrollPeriodService],
    }).compile();

    controller = module.get<PayrollPeriodController>(PayrollPeriodController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
