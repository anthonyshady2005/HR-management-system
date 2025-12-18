import { PartialType } from '@nestjs/mapped-types';
import { CreateSigningBonusDto } from './create-signing-bonus.dto';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ConfigStatus } from '../enums/payroll-configuration-enums';

export class UpdateSigningBonusDto extends PartialType(CreateSigningBonusDto) {
  @IsEnum(ConfigStatus)
  @IsOptional()
  status?: ConfigStatus;

  @IsOptional()
  approvedBy?: string;

  @IsDateString()
  @IsOptional()
  approvedAt?: Date;
}
