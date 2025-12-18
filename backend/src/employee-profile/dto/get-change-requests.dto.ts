import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ProfileChangeStatus } from '../enums/employee-profile.enums';

export class GetChangeRequestsDto {
  @ApiPropertyOptional({
    description: 'Page number',
    default: 1,
    type: Number,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 20,
    type: Number,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    description:
      'Filter by status (PENDING, APPROVED, REJECTED, CANCELED). Pass "ALL" or omit to get all statuses.',
    enum: ProfileChangeStatus,
  })
  @IsOptional()
  @IsString()
  @IsIn([...Object.values(ProfileChangeStatus), 'ALL'])
  status?: string;
}
