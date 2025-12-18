import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class AddHolidayDto {
  @ApiProperty({
    description: 'Holiday ID from Time Management',
    example: '507f1f77bcf86cd799439099',
  })
  @IsMongoId()
  @IsNotEmpty()
  holidayId: string;
}
