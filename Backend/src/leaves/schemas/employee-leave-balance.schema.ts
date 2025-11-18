import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type EmployeeLeaveBalanceDocument =
  HydratedDocument<EmployeeLeaveBalance>;

@Schema({ timestamps: true })
export class EmployeeLeaveBalance extends Document {
  @ApiProperty({
    description: 'Employee ID this balance belongs to',
    example: 'EMP001',
  })
  @Prop({ required: true })
  employeeId: string;

  @ApiProperty({
    description: 'Reference to the leave type (Annual, Sick, etc.)',
    example: '507f1f77bcf86cd799439011',
  })
  @Prop({ type: Types.ObjectId, ref: 'LeaveType', required: true })
  leaveTypeId: Types.ObjectId;

  @ApiProperty({
    description: 'Calendar year this balance applies to',
    example: 2025,
  })
  @Prop({ required: true })
  year: number;

  @ApiProperty({
    description:
      'Total days accrued for this year through automatic accrual process (REQ-040)',
    example: 21,
    default: 0,
  })
  @Prop({ default: 0 })
  accrued: number;

  @ApiProperty({
    description: 'Total days taken (approved and completed leaves)',
    example: 5,
    default: 0,
  })
  @Prop({ default: 0 })
  taken: number;

  @ApiProperty({
    description:
      'Days currently pending approval. Reserved from balance until approved or rejected.',
    example: 3,
    default: 0,
  })
  @Prop({ default: 0 })
  pending: number;

  @ApiProperty({
    description:
      'Days carried over from previous year, subject to maximum cap (45 days) and expiry rules',
    example: 2,
    default: 0,
  })
  @Prop({ default: 0 })
  carriedOver: number;

  @ApiProperty({
    description:
      'Manual adjustments made by HR Admin (positive or negative). All adjustments are logged in LeaveAdjustment collection (BR 17).',
    example: 0,
    default: 0,
  })
  @Prop({ default: 0 })
  manualAdjustments: number;

  @ApiProperty({
    description:
      'Calculated remaining balance: accrued + carriedOver + manualAdjustments - taken - pending',
    example: 15,
  })
  @Prop()
  remaining: number;

  @ApiPropertyOptional({
    description: 'Timestamp of last accrual processing for this balance',
    example: '2025-11-01T00:00:00.000Z',
  })
  @Prop()
  lastAccrualDate: Date;

  @ApiPropertyOptional({
    description: 'Timestamp of last year-end reset (REQ-041)',
    example: '2025-01-01T00:00:00.000Z',
  })
  @Prop()
  lastResetDate: Date;

  @ApiPropertyOptional({
    description: 'Scheduled date for next accrual processing',
    example: '2025-12-01T00:00:00.000Z',
  })
  @Prop()
  nextAccrualDate: Date;

  @ApiProperty({
    description:
      'Whether accrual is currently paused (e.g., during unpaid leave or suspension) as per BR 11',
    example: false,
    default: false,
  })
  @Prop({ default: false })
  isAccrualPaused: boolean;

  @ApiPropertyOptional({
    description:
      'Reason for paused accrual (e.g., "Unpaid Leave", "Suspension")',
    example: 'Unpaid Leave',
  })
  @Prop()
  pauseReason: string;
}

export const EmployeeLeaveBalanceSchema =
  SchemaFactory.createForClass(EmployeeLeaveBalance);

// Indexes
EmployeeLeaveBalanceSchema.index(
  { employeeId: 1, leaveTypeId: 1, year: 1 },
  { unique: true },
);
EmployeeLeaveBalanceSchema.index({ employeeId: 1 });
EmployeeLeaveBalanceSchema.index({ year: 1 });
EmployeeLeaveBalanceSchema.index({ lastAccrualDate: 1 });

// Virtual for remaining calculation
EmployeeLeaveBalanceSchema.virtual('calculatedRemaining').get(function () {
  return (
    this.accrued +
    this.carriedOver +
    this.manualAdjustments -
    this.taken -
    this.pending
  );
});
