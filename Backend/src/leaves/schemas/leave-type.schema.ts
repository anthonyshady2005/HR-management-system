import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type LeaveTypeDocument = HydratedDocument<LeaveType>;

@Schema({ timestamps: true })
export class LeaveType extends Document {
  @ApiProperty({
    description:
      'Unique code for the leave type (e.g., ANN for Annual, SICK for Sick Leave)',
    example: 'ANN',
  })
  @Prop({ required: true, unique: true })
  leaveTypeId: string;

  @ApiProperty({
    description: 'Display name of the leave type',
    example: 'Annual Leave',
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    description: 'Reference to the leave category (Paid, Unpaid, Special)',
    example: '507f1f77bcf86cd799439011',
  })
  @Prop({ type: Types.ObjectId, ref: 'LeaveCategory', required: true })
  categoryId: Types.ObjectId;

  @ApiProperty({
    description:
      'Whether this leave type is paid or unpaid. Affects salary calculations and payroll integration.',
    example: true,
  })
  @Prop({ required: true })
  isPaid: boolean;

  @ApiProperty({
    description:
      'Whether supporting documents (e.g., medical certificates) are required for this leave type',
    example: false,
    default: false,
  })
  @Prop({ default: false })
  requiresDocument: boolean;

  @ApiPropertyOptional({
    description:
      'Maximum number of days allowed per single request. Used to enforce organizational policies.',
    example: 15,
  })
  @Prop()
  maxDaysPerRequest: number;

  @ApiPropertyOptional({
    description:
      'Maximum days allowed per year. Used to enforce annual limits (e.g., 21 sick days as per BR 41)',
    example: 21,
  })
  @Prop()
  maxDaysPerYear: number;

  @ApiProperty({
    description:
      'Whether this leave type deducts from employee annual balance. Annual leave deducts, sick leave typically does not.',
    example: true,
    default: true,
  })
  @Prop({ default: true })
  isDeductedFromBalance: boolean;

  @ApiPropertyOptional({
    description:
      'Number of days after which supporting documents become mandatory. Example: sick leave > 1 day requires medical certificate.',
    example: 1,
  })
  @Prop()
  documentRequiredAfterDays: number;

  @ApiPropertyOptional({
    description:
      'Payroll pay code for integration with Payroll subsystem (BR 6). Used to categorize leave-related salary adjustments.',
    example: 'LEAVE-ANN',
  })
  @Prop()
  payCode: string;

  @ApiProperty({
    description: 'Whether manager/HR approval is required for this leave type',
    example: true,
    default: false,
  })
  @Prop({ default: false })
  requiresApproval: boolean;

  @ApiProperty({
    description:
      'Whether unused days can be carried over to the next year. Typically true for annual leave.',
    example: true,
    default: false,
  })
  @Prop({ default: false })
  canBeCarriedOver: boolean;

  @ApiProperty({
    description:
      'Whether unused days can be encashed at year-end or termination. Annual leave is typically encashable (BR 53).',
    example: true,
    default: false,
  })
  @Prop({ default: false })
  canBeEncashed: boolean;

  @ApiPropertyOptional({
    description: 'Hex color code for UI calendar display',
    example: '#4CAF50',
  })
  @Prop()
  color: string;

  @ApiProperty({
    description: 'Whether this leave type is currently active in the system',
    example: true,
    default: true,
  })
  @Prop({ default: true })
  isActive: boolean;

  @ApiPropertyOptional({
    description:
      'Detailed description of the leave type including eligibility and usage rules',
    example: 'Regular annual vacation leave as per labor law',
  })
  @Prop()
  description: string;
}

export const LeaveTypeSchema = SchemaFactory.createForClass(LeaveType);

// Indexes
LeaveTypeSchema.index({ leaveTypeId: 1 });
LeaveTypeSchema.index({ categoryId: 1 });
LeaveTypeSchema.index({ isActive: 1 });
LeaveTypeSchema.index({ payCode: 1 });
