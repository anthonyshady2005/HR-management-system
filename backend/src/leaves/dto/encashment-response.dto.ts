import { ApiProperty } from '@nestjs/swagger';

export class EncashmentResponseDto {
  @ApiProperty({ description: 'Employee ID' })
  employeeId: string;

  @ApiProperty({ description: 'Leave type' })
  leaveType: string;

  @ApiProperty({ description: 'Unused leave days (capped at 30)' })
  unusedDays: number;

  @ApiProperty({ description: 'Daily salary rate' })
  dailySalaryRate: number;

  @ApiProperty({ description: 'Total encashment amount' })
  encashmentAmount: number;

  @ApiProperty({ description: 'Calculation formula used' })
  formula: string;
}
