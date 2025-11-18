import { ApiProperty } from '@nestjs/swagger';

class ApprovalStepResponse {
  @ApiProperty({ example: 'EMP010' })
  approverId: string;

  @ApiProperty({ example: 'lineManager' })
  role: string;

  @ApiProperty({ example: 'approved' })
  action: string;

  @ApiProperty({ example: 'Approved for vacation' })
  comments: string;

  @ApiProperty({ example: '2025-11-17T10:00:00.000Z' })
  actionDate: Date;
}

export class LeaveRequestResponseDto {
  @ApiProperty({ example: 'LR-2025-000001' })
  requestId: string;

  @ApiProperty({ example: 'EMP001' })
  employeeId: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  leaveTypeId: string;

  @ApiProperty({ example: '2025-12-01' })
  startDate: Date;

  @ApiProperty({ example: '2025-12-05' })
  endDate: Date;

  @ApiProperty({ example: 5 })
  totalDays: number;

  @ApiProperty({ example: 'Family vacation' })
  reason: string;

  @ApiProperty({ example: 'pendingManagerApproval' })
  status: string;

  @ApiProperty({ type: [ApprovalStepResponse] })
  approvalChain: ApprovalStepResponse[];

  @ApiProperty({ example: 15 })
  balanceAtSubmission: number;

  @ApiProperty({ example: '2025-11-17T09:30:00.000Z' })
  submittedAt: Date;
}
