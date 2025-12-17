import { PartialType } from '@nestjs/mapped-types';
import { CreatePayrollPolicyDto } from './create-payroll-policy.dto';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ConfigStatus } from '../enums/payroll-configuration-enums';

export class UpdatePayrollPolicyDto extends PartialType(CreatePayrollPolicyDto) {
  @IsEnum(ConfigStatus)
  @IsOptional()
  status?: ConfigStatus;

  @IsOptional()
  approvedBy?: string;

  @IsDateString()
  @IsOptional()
  approvedAt?: Date;
}
