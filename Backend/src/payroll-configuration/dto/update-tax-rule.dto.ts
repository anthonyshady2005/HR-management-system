import { PartialType } from '@nestjs/mapped-types';
import { CreateTaxRuleDto } from './create-tax-rule.dto';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ConfigStatus } from '../enums/payroll-configuration-enums';

export class UpdateTaxRuleDto extends PartialType(CreateTaxRuleDto) {
  @IsEnum(ConfigStatus)
  @IsOptional()
  status?: ConfigStatus;

  @IsOptional()
  approvedBy?: string;

  @IsDateString()
  @IsOptional()
  approvedAt?: Date;
}
