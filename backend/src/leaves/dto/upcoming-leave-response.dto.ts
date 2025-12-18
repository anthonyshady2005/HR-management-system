import { ApiProperty } from '@nestjs/swagger';

export class UpcomingLeaveResponseDto {
  @ApiProperty({ description: 'Leave request ID' })
  requestId: string;

  @ApiProperty({ description: 'Employee ID' })
  employeeId: string;

  @ApiProperty({ description: 'Employee name' })
  employeeName: string;

  @ApiProperty({ description: 'Leave type' })
  leaveType: string;

  @ApiProperty({ description: 'Start date' })
  from: Date;

  @ApiProperty({ description: 'End date' })
  to: Date;

  @ApiProperty({ description: 'Duration in days' })
  durationDays: number;

  @ApiProperty({ description: 'Request status' })
  status: string;
}
