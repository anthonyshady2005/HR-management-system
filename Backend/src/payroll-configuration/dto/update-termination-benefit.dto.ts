import { PartialType } from '@nestjs/mapped-types';
import { CreateTerminationBenefitDto } from './create-termination-benefit.dto';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ConfigStatus } from '../enums/payroll-configuration-enums';

export class UpdateTerminationBenefitDto extends PartialType(CreateTerminationBenefitDto) {
  @IsEnum(ConfigStatus)
  @IsOptional()
  status?: ConfigStatus;

  @IsOptional()
  approvedBy?: string;

  @IsDateString()
  @IsOptional()
  approvedAt?: Date;
}
