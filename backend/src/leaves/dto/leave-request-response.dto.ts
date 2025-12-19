import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveTypeResponseDto } from './leave-type-response.dto';

class ApprovalFlowItemDto {
  @ApiProperty({
    description: 'Role in approval flow',
    example: 'Manager',
  })
  role: string;

  @ApiProperty({
    description: 'Status of this approval step',
    example: 'pending',
  })
  status: string;

  @ApiPropertyOptional({
    description: 'ID of user who decided',
    example: '507f1f77bcf86cd799439014',
  })
  decidedBy?: string;

  @ApiPropertyOptional({
    description: 'Name of user who decided',
    example: 'John Doe',
  })
  decidedByName?: string;

  @ApiPropertyOptional({
    description: 'Decision timestamp',
    example: '2024-11-16T14:30:00Z',
  })
  decidedAt?: Date;
}

export class LeaveRequestResponseDto {
  @ApiProperty({
    description: 'Leave request ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Employee ID',
    example: '507f1f77bcf86cd799439012',
  })
  employeeId: string;

  @ApiPropertyOptional({
    description: 'Employee display name',
    example: 'John Doe',
  })
  employeeDisplayName?: string;

  @ApiProperty({
    description: 'Leave type details',
    type: () => LeaveTypeResponseDto,
  })
  leaveType: LeaveTypeResponseDto;

  @ApiProperty({
    description: 'Leave date range',
    example: { from: '2024-12-01', to: '2024-12-05' },
  })
  dates: { from: Date; to: Date };

  @ApiProperty({
    description: 'Duration in days',
    example: 5,
  })
  durationDays: number;

  @ApiPropertyOptional({
    description: 'Justification provided',
    example: 'Family vacation',
  })
  justification?: string;

  @ApiPropertyOptional({
    description: 'Attachment ID',
    example: '507f1f77bcf86cd799439013',
  })
  attachmentId?: string;

  @ApiProperty({
    description: 'Approval flow steps',
    type: [ApprovalFlowItemDto],
  })
  approvalFlow: ApprovalFlowItemDto[];

  @ApiProperty({
    description: 'Overall request status',
    example: 'pending',
  })
  status: string;

  @ApiProperty({
    description: 'Irregular pattern flag',
    example: false,
  })
  irregularPatternFlag: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-11-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-11-15T10:30:00Z',
  })
  updatedAt: Date;
}
