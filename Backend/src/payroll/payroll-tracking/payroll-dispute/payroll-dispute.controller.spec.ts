import { Test, TestingModule } from '@nestjs/testing';
import { PayrollDisputeController } from './payroll-dispute.controller';

describe('PayrollDisputeController', () => {
  let controller: PayrollDisputeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollDisputeController],
    }).compile();

    controller = module.get<PayrollDisputeController>(PayrollDisputeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
