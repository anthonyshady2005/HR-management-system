import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveChangeRequestDto {
  @ApiPropertyOptional({
    description: 'Comments from the approver',
    example: 'Approved - aligns with Q4 hiring plan',
  })
  @IsOptional()
  @IsString()
  comments?: string;
}

