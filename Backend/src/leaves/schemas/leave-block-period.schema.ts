import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type LeaveBlockPeriodDocument = HydratedDocument<LeaveBlockPeriod>;

@Schema({ timestamps: true })
export class LeaveBlockPeriod extends Document {
  @ApiProperty({
    description: 'Unique block period identifier',
    example: 'BLOCK-2025-001',
  })
  @Prop({ required: true, unique: true })
  blockId: string;

  @ApiProperty({
    description:
      'Name of the block period (e.g., Year-end Freeze, Audit Period, Peak Season)',
    example: 'Year-End Audit Freeze',
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    description: 'Start date of block period (inclusive)',
    example: '2025-12-25',
  })
  @Prop({ required: true })
  startDate: Date;

  @ApiProperty({
    description: 'End date of block period (inclusive)',
    example: '2025-12-31',
  })
  @Prop({ required: true })
  endDate: Date;

  @ApiProperty({
    description:
      'Business reason for blocking leave during this period (BR 55)',
    example: 'Annual audit period - critical business operations',
  })
  @Prop({ required: true })
  reason: string;

  @ApiProperty({
    description:
      'Leave types affected by this block. Empty array means all types are blocked.',
    example: [],
    type: [String],
  })
  @Prop({ type: [Types.ObjectId], ref: 'LeaveType', default: [] })
  affectedLeaveTypes: Types.ObjectId[];

  @ApiProperty({
    description:
      'List of employee IDs exempt from this block (e.g., senior management)',
    example: ['EMP-CEO', 'EMP010'],
    type: [String],
  })
  @Prop({ type: [String], default: [] })
  exemptEmployeeIds: string[];

  @ApiProperty({
    description: 'List of departments exempt from this block',
    example: ['DEPT-SALES'],
    type: [String],
  })
  @Prop({ type: [String], default: [] })
  exemptDepartments: string[];

  @ApiProperty({
    description: 'Whether this block period is currently active',
    example: true,
    default: true,
  })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether to allow emergency leave requests during this period',
    example: false,
    default: false,
  })
  @Prop({ default: false })
  allowEmergencyRequests: boolean;
}

export const LeaveBlockPeriodSchema =
  SchemaFactory.createForClass(LeaveBlockPeriod);

// Indexes
LeaveBlockPeriodSchema.index({ startDate: 1, endDate: 1 });
LeaveBlockPeriodSchema.index({ isActive: 1 });
