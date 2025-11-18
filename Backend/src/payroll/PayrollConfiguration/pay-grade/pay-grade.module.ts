import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PayGradeService } from './pay-grade.service';
import { PayGradeController } from './pay-grade.controller';
import { PayGrade, PayGradeSchema } from './models/pay-grade.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'PayGrade', schema: PayGradeSchema }]),
  ],
  providers: [PayGradeService],
  controllers: [PayGradeController],
})
export class PayGradeModule {}
