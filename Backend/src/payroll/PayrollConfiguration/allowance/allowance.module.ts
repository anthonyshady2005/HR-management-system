import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AllowanceController } from './allowance.controller';
import { AllowanceService } from './allowance.service';
import { Allowance, AllowanceSchema } from './models/allowance.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Allowance', schema: AllowanceSchema }]),
  ],
  controllers: [AllowanceController],
  providers: [AllowanceService],
})
export class AllowanceModule {}
