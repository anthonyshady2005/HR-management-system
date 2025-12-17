import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RejectChangeRequestDto {
  @ApiProperty({
    description: 'Reason for rejection',
    example: 'Budget constraints - position not approved for Q4',
  })
  @IsNotEmpty()
  @IsString()
  comments: string;
}

