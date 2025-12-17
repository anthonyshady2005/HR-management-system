import { ApiProperty } from '@nestjs/swagger';

export class EmployeeBalanceDto {
  @ApiProperty({ description: 'Leave type name' })
  leaveType: string;

  @ApiProperty({ description: 'Remaining balance' })
  remaining: number;

  @ApiProperty({ description: 'Days taken' })
  taken: number;

  @ApiProperty({ description: 'Pending days' })
  pending: number;

  @ApiProperty({ description: 'Carry forward days' })
  carryForward: number;
}

export class TeamBalanceResponseDto {
  @ApiProperty({ description: 'Employee ID' })
  employeeId: string;

  @ApiProperty({ description: 'Employee name' })
  employeeName: string;

  @ApiProperty({ description: 'Employee number' })
  employeeNumber: string;

  @ApiProperty({
    description: 'Leave balances by type',
    type: [EmployeeBalanceDto],
  })
  balances: EmployeeBalanceDto[];
}
