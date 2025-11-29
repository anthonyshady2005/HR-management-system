import { ApiProperty } from '@nestjs/swagger';
import { LeaveTypeResponseDto } from './leave-type-response.dto';

export class LeaveAdjustmentResponseDto {
    @ApiProperty({
        description: 'Adjustment ID',
        example: '507f1f77bcf86cd799439011'
    })
    id: string;

    @ApiProperty({
        description: 'Employee ID',
        example: '507f1f77bcf86cd799439012'
    })
    employeeId: string;

    @ApiProperty({
        description: 'Leave type details',
        type: () => LeaveTypeResponseDto
    })
    leaveType: LeaveTypeResponseDto;

    @ApiProperty({
        description: 'Type of adjustment',
        example: 'add'
    })
    adjustmentType: string;

    @ApiProperty({
        description: 'Amount adjusted',
        example: 5
    })
    amount: number;

    @ApiProperty({
        description: 'Reason for adjustment',
        example: 'Compensation for overtime work'
    })
    reason: string;

    @ApiProperty({
        description: 'HR user who made the adjustment',
        example: '507f1f77bcf86cd799439013'
    })
    hrUserId: string;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2024-11-15T10:30:00Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2024-11-15T10:30:00Z'
    })
    updatedAt: Date;
}