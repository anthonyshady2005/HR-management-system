import { Test, TestingModule } from '@nestjs/testing';
import { BonusPolicyController } from './bonus-policy.controller';

describe('BonusPolicyController', () => {
  let controller: BonusPolicyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BonusPolicyController],
    }).compile();

    controller = module.get<BonusPolicyController>(BonusPolicyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
