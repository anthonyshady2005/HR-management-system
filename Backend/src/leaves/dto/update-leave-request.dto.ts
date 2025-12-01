import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateLeaveRequestDto {
  @ApiPropertyOptional({
    description: 'Updated start date',
    example: '2024-12-01',
  })
  @IsOptional()
  fromDate?: Date;

  @ApiPropertyOptional({
    description: 'Updated end date',
    example: '2024-12-05',
  })
  @IsOptional()
  toDate?: Date;

  @ApiPropertyOptional({ description: 'Updated duration in days', example: 5 })
  @IsOptional()
  @IsNumber()
  durationDays?: number;

  @ApiPropertyOptional({ description: 'Updated justification' })
  @IsOptional()
  @IsString()
  justification?: string;

  @ApiPropertyOptional({ description: 'Updated attachment ID' })
  @IsOptional()
  @IsString()
  attachmentId?: string;
}
