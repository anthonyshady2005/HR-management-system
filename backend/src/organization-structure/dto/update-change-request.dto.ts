import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateChangeRequestDto {
  @ApiPropertyOptional({
    description: 'Details of the requested change',
    example: 'Updated: Request to add a new Senior Developer position in Engineering',
  })
  @IsOptional()
  @IsString()
  details?: string;

  @ApiPropertyOptional({
    description: 'Reason for the change request',
    example: 'Team expansion requires additional senior role',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

