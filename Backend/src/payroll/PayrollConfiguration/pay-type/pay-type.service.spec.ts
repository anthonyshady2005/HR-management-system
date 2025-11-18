import { Test, TestingModule } from '@nestjs/testing';
import { PayTypeService } from './pay-type.service';

describe('PayTypeService', () => {
  let service: PayTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PayTypeService],
    }).compile();

    service = module.get<PayTypeService>(PayTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
