import { ApiProperty } from '@nestjs/swagger';

export class AuditTrailResponseDto {
  @ApiProperty({ description: 'Adjustment ID' })
  adjustmentId: string;

  @ApiProperty({ description: 'Employee ID' })
  employeeId: string;

  @ApiProperty({ description: 'Leave type' })
  leaveType: string;

  @ApiProperty({ description: 'Adjustment type (ADD, DEDUCT, ENCASHMENT)' })
  adjustmentType: string;

  @ApiProperty({ description: 'Amount adjusted' })
  amount: number;

  @ApiProperty({ description: 'Reason for adjustment' })
  reason: string;

  @ApiProperty({ description: 'HR user who made the adjustment' })
  hrUserId: string;

  @ApiProperty({ description: 'HR user name' })
  hrUserName: string;

  @ApiProperty({ description: 'Timestamp of adjustment' })
  createdAt: Date;
}
