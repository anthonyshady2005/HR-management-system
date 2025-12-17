import { PartialType } from '@nestjs/mapped-types';
import { CreateAllowanceDto } from './create-allowance.dto';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ConfigStatus } from '../enums/payroll-configuration-enums';

export class UpdateAllowanceDto extends PartialType(CreateAllowanceDto) {
  @IsEnum(ConfigStatus)
  @IsOptional()
  status?: ConfigStatus;

  @IsOptional()
  approvedBy?: string;

  @IsDateString()
  @IsOptional()
  approvedAt?: Date;
}
