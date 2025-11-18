import { Test, TestingModule } from '@nestjs/testing';
import { ResignationPolicyService } from './resignation-policy.service';

describe('ResignationPolicyService', () => {
  let service: ResignationPolicyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResignationPolicyService],
    }).compile();

    service = module.get<ResignationPolicyService>(ResignationPolicyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
