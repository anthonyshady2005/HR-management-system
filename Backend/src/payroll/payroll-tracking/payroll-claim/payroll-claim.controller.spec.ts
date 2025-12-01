import { Test, TestingModule } from '@nestjs/testing';
import { PayrollClaimController } from './payroll-claim.controller';

describe('PayrollClaimController', () => {
  let controller: PayrollClaimController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollClaimController],
    }).compile();

    controller = module.get<PayrollClaimController>(PayrollClaimController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
