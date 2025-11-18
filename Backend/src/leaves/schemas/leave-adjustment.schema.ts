import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type LeaveAdjustmentDocument = HydratedDocument<LeaveAdjustment>;

@Schema({ timestamps: true })
export class LeaveAdjustment extends Document {
  @ApiProperty({
    description: 'Unique adjustment identifier',
    example: 'ADJ-2025-000001',
  })
  @Prop({ required: true, unique: true })
  adjustmentId: string;

  @ApiProperty({
    description: 'Employee ID whose balance is being adjusted',
    example: 'EMP001',
  })
  @Prop({ required: true })
  employeeId: string;

  @ApiProperty({
    description: 'Leave type being adjusted',
    example: '507f1f77bcf86cd799439011',
  })
  @Prop({ type: Types.ObjectId, ref: 'LeaveType', required: true })
  leaveTypeId: Types.ObjectId;

  @ApiProperty({
    description: 'Type of adjustment operation',
    example: 'manual',
    enum: [
      'manual',
      'accrual',
      'carryover',
      'reset',
      'encashment',
      'retroactiveDeduction',
      'systemCorrection',
    ],
  })
  @Prop({
    type: String,
    enum: [
      'manual',
      'accrual',
      'carryover',
      'reset',
      'encashment',
      'retroactiveDeduction',
      'systemCorrection',
    ],
    required: true,
  })
  adjustmentType: string;

  @ApiProperty({
    description: 'Balance before adjustment',
    example: 21,
  })
  @Prop({ required: true })
  daysBefore: number;

  @ApiProperty({
    description: 'Balance after adjustment',
    example: 23,
  })
  @Prop({ required: true })
  daysAfter: number;

  @ApiProperty({
    description:
      'Net change in days (positive for addition, negative for deduction)',
    example: 2,
  })
  @Prop({ required: true })
  daysChanged: number;

  @ApiProperty({
    description:
      'Detailed reason for adjustment (BR 17: audit trail requirement)',
    example: 'Compensation for overtime work during project deadline',
  })
  @Prop({ required: true })
  reason: string;

  @ApiProperty({
    description: 'Employee ID of HR Admin who performed the adjustment',
    example: 'HR-ADMIN-001',
  })
  @Prop({ required: true })
  performedBy: string;

  @ApiPropertyOptional({
    description:
      'Related leave request ID if adjustment is linked to a request',
    example: 'LR-2025-000050',
  })
  @Prop()
  relatedRequestId: string;

  @ApiPropertyOptional({
    description:
      'Related payroll ID for encashment adjustments (OFF-013: final settlement)',
    example: 'PAY-2025-000100',
  })
  @Prop()
  relatedPayrollId: string;

  @ApiProperty({
    description: 'Timestamp when adjustment was performed',
    example: '2025-11-17T14:30:00.000Z',
  })
  @Prop({ default: Date.now })
  timestamp: Date;

  @ApiPropertyOptional({
    description: 'Additional notes or comments about this adjustment',
    example: 'Approved by HR Manager - special case',
  })
  @Prop()
  notes: string;
}

export const LeaveAdjustmentSchema =
  SchemaFactory.createForClass(LeaveAdjustment);

// Indexes (BR 17 - audit trail)
LeaveAdjustmentSchema.index({ adjustmentId: 1 });
LeaveAdjustmentSchema.index({ employeeId: 1 });
LeaveAdjustmentSchema.index({ performedBy: 1 });
LeaveAdjustmentSchema.index({ timestamp: -1 });
LeaveAdjustmentSchema.index({ adjustmentType: 1 });
