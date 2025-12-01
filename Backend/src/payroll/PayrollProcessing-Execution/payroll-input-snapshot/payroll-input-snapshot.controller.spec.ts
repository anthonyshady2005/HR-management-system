import { Test, TestingModule } from '@nestjs/testing';
import { PayrollInputSnapshotController } from './payroll-input-snapshot.controller';
import { PayrollInputSnapshotService } from './payroll-input-snapshot.service';

describe('PayrollInputSnapshotController', () => {
  let controller: PayrollInputSnapshotController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollInputSnapshotController],
      providers: [PayrollInputSnapshotService],
    }).compile();

    controller = module.get<PayrollInputSnapshotController>(PayrollInputSnapshotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
