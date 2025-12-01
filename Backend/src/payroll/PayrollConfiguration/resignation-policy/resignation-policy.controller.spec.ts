import { Test, TestingModule } from '@nestjs/testing';
import { ResignationPolicyController } from './resignation-policy.controller';

describe('ResignationPolicyController', () => {
  let controller: ResignationPolicyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResignationPolicyController],
    }).compile();

    controller = module.get<ResignationPolicyController>(ResignationPolicyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
