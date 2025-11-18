import { Test, TestingModule } from '@nestjs/testing';
import { BonusPolicyService } from './bonus-policy.service';

describe('BonusPolicyService', () => {
  let service: BonusPolicyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BonusPolicyService],
    }).compile();

    service = module.get<BonusPolicyService>(BonusPolicyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
