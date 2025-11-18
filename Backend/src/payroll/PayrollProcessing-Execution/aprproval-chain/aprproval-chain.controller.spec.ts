import { Test, TestingModule } from '@nestjs/testing';
import { AprprovalChainController } from './aprproval-chain.controller';
import { AprprovalChainService } from './aprproval-chain.service';

describe('AprprovalChainController', () => {
  let controller: AprprovalChainController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AprprovalChainController],
      providers: [AprprovalChainService],
    }).compile();

    controller = module.get<AprprovalChainController>(AprprovalChainController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
