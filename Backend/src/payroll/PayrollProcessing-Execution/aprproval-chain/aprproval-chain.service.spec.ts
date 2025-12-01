import { Test, TestingModule } from '@nestjs/testing';
import { AprprovalChainService } from './aprproval-chain.service';

describe('AprprovalChainService', () => {
  let service: AprprovalChainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AprprovalChainService],
    }).compile();

    service = module.get<AprprovalChainService>(AprprovalChainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
