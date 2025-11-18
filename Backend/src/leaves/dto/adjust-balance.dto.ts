import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsMongoId } from 'class-validator';

export class AdjustBalanceDto {
  @ApiProperty({
    description: 'Employee ID whose balance is being adjusted',
    example: 'EMP001',
  })
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({
    description: 'MongoDB ObjectId of the leave type',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsNotEmpty()
  leaveTypeId: string;

  @ApiProperty({
    description: 'Number of days to adjust (positive for addition, negative for deduction)',
    example: 2,
  })
  @IsNumber()
  @IsNotEmpty()
  adjustmentDays: number;

  @ApiProperty({
    description: 'Reason for the adjustment',
    example: 'Compensation for overtime work',
    minLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    description: 'Employee ID of HR Admin performing the adjustment',
    example: 'HR-ADMIN-001',
  })
  @IsString()
  @IsNotEmpty()
  performedBy: string;
}