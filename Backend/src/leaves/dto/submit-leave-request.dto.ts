import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsDateString,
  IsString,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class LeaveDateRangeDto {
  @ApiProperty({
    description: 'Leave start date',
    example: '2024-12-01',
  })
  @IsDateString()
  @IsNotEmpty()
  from: Date;

  @ApiProperty({
    description: 'Leave end date',
    example: '2024-12-05',
  })
  @IsDateString()
  @IsNotEmpty()
  to: Date;
}

export class SubmitLeaveRequestDto {
  @ApiProperty({
    description: 'ID of the employee requesting leave',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({
    description: 'ID of the leave type',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId()
  @IsNotEmpty()
  leaveTypeId: string;

  @ApiProperty({
    description: 'Leave date range',
    type: LeaveDateRangeDto,
  })
  @ValidateNested()
  @Type(() => LeaveDateRangeDto)
  @IsNotEmpty()
  dates: LeaveDateRangeDto;

  @ApiProperty({
    description: 'Duration of leave in days',
    example: 5,
    minimum: 0.5,
  })
  @IsNumber()
  @Min(0.5)
  @IsNotEmpty()
  durationDays: number;

  @ApiPropertyOptional({
    description: 'Justification for the leave request',
    example: 'Family vacation',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  justification?: string;

  @ApiPropertyOptional({
    description: 'ID of the attachment document (if required)',
    example: '507f1f77bcf86cd799439013',
  })
  @IsMongoId()
  @IsOptional()
  attachmentId?: string;
}
