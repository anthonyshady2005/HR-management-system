import { PartialType } from '@nestjs/mapped-types';
import { CreatePayTypeDto } from './create-pay-type.dto';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ConfigStatus } from '../enums/payroll-configuration-enums';

export class UpdatePayTypeDto extends PartialType(CreatePayTypeDto) {
  @IsEnum(ConfigStatus)
  @IsOptional()
  status?: ConfigStatus;

  @IsOptional()
  approvedBy?: string;

  @IsDateString()
  @IsOptional()
  approvedAt?: Date;
}
