import { PartialType } from '@nestjs/mapped-types';
import { CreateInsuranceBracketDto } from './create-insurance-bracket.dto';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ConfigStatus } from '../enums/payroll-configuration-enums';

export class UpdateInsuranceBracketDto extends PartialType(CreateInsuranceBracketDto) {
  @IsEnum(ConfigStatus)
  @IsOptional()
  status?: ConfigStatus;

  @IsOptional()
  approvedBy?: string;

  @IsDateString()
  @IsOptional()
  approvedAt?: Date;
}
