import { ApiProperty } from '@nestjs/swagger';

export class BatchEntitlementErrorDto {
  @ApiProperty({
    description: 'Employee ID that failed',
    example: '507f1f77bcf86cd799439011',
  })
  employeeId: string;

  @ApiProperty({
    description: 'Error message',
    example: 'Employee not found',
  })
  error: string;
}

export class BatchEntitlementResponseDto {
  @ApiProperty({
    description: 'Number of entitlements successfully created',
    example: 15,
  })
  created: number;

  @ApiProperty({
    description: 'Number of entitlements skipped (already exist)',
    example: 3,
  })
  skipped: number;

  @ApiProperty({
    description: 'Number of entitlements that failed to create',
    example: 2,
  })
  failed: number;

  @ApiProperty({
    description: 'Array of employee IDs that were successfully created',
    type: [String],
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
  })
  createdEmployeeIds: string[];

  @ApiProperty({
    description: 'Array of employee IDs that were skipped',
    type: [String],
    example: ['507f1f77bcf86cd799439013'],
  })
  skippedEmployeeIds: string[];

  @ApiProperty({
    description: 'Array of errors for failed entitlements',
    type: [BatchEntitlementErrorDto],
  })
  errors: BatchEntitlementErrorDto[];
}
