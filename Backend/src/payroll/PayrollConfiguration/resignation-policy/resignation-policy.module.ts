import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResignationPolicyService } from './resignation-policy.service';
import { ResignationPolicyController } from './resignation-policy.controller';
import {
  ResignationPolicy,
  ResignationPolicySchema,
} from './models/resignation-policy.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ResignationPolicy', schema: ResignationPolicySchema },
    ]),
  ],
  providers: [ResignationPolicyService],
  controllers: [ResignationPolicyController],
})
export class ResignationPolicyModule {}
