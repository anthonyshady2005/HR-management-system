import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AddBlockedPeriodDto {
  @ApiProperty({
    description: 'Start date of blocked period',
    example: '2024-12-20',
  })
  @IsNotEmpty()
  from: Date;

  @ApiProperty({
    description: 'End date of blocked period',
    example: '2024-12-31',
  })
  @IsNotEmpty()
  to: Date;

  @ApiProperty({
    description: 'Reason for blocking this period',
    example: 'Year-end closing',
  })
  @IsNotEmpty()
  reason: string;
}
