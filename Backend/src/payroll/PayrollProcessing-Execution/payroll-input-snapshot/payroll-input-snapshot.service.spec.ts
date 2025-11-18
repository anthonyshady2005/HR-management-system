import { Test, TestingModule } from '@nestjs/testing';
import { PayrollInputSnapshotService } from './payroll-input-snapshot.service';

describe('PayrollInputSnapshotService', () => {
  let service: PayrollInputSnapshotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PayrollInputSnapshotService],
    }).compile();

    service = module.get<PayrollInputSnapshotService>(PayrollInputSnapshotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
