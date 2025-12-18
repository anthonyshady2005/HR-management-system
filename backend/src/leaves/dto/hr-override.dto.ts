import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class HROverrideDto {
  @ApiProperty({
    description: 'Override decision',
    enum: ['approve', 'reject'],
    example: 'approve',
  })
  @IsEnum(['approve', 'reject'])
  @IsNotEmpty()
  decision: 'approve' | 'reject';

  @ApiProperty({
    description: 'Justification for override (required)',
    example: 'Emergency medical situation requires immediate approval',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  justification: string;
}
