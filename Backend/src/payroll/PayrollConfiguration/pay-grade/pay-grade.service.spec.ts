import { Test, TestingModule } from '@nestjs/testing';
import { PayGradeService } from './pay-grade.service';

describe('PayGradeService', () => {
  let service: PayGradeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PayGradeService],
    }).compile();

    service = module.get<PayGradeService>(PayGradeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
