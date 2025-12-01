import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaxRuleController } from './tax-rule.controller';
import { TaxRuleService } from './tax-rule.service';
import { TaxRule, TaxRuleSchema } from './models/tax-rule.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TaxRule.name, schema: TaxRuleSchema }]),
  ],
  controllers: [TaxRuleController],
  providers: [TaxRuleService],
  exports: [TaxRuleService],
})
export class TaxRuleModule {}
