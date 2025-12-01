import { Test, TestingModule } from '@nestjs/testing';
import { InsuranceBracketService } from './insurance-bracket.service';

describe('InsuranceBracketService', () => {
  let service: InsuranceBracketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InsuranceBracketService],
    }).compile();

    service = module.get<InsuranceBracketService>(InsuranceBracketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
