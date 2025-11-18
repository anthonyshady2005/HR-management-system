import { Module } from '@nestjs/common';
import { PayrollInputSnapshotService } from './payroll-input-snapshot.service';
import { PayrollInputSnapshotController } from './payroll-input-snapshot.controller';

@Module({
  controllers: [PayrollInputSnapshotController],
  providers: [PayrollInputSnapshotService],
})
export class PayrollInputSnapshotModule {}
