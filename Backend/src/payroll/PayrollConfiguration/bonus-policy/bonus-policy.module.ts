import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BonusPolicyService } from './bonus-policy.service';
import { BonusPolicyController } from './bonus-policy.controller';
import { BonusPolicy, BonusPolicySchema } from './models/bonus-policy.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'BonusPolicy', schema: BonusPolicySchema },
    ]),
  ],
  providers: [BonusPolicyService],
  controllers: [BonusPolicyController],
})
export class BonusPolicyModule {}
