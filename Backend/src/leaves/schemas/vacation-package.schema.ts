import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type VacationPackageDocument = HydratedDocument<VacationPackage>;

@Schema({ _id: false })
export class EligibilityCriteria {
  @ApiProperty({
    description: 'Minimum tenure in months required for this package',
    example: 0,
  })
  @Prop({ default: 0 })
  minTenureMonths: number;

  @ApiProperty({
    description:
      'List of eligible contract types (permanent, temporary, contract, probation)',
    example: ['permanent', 'temporary'],
    type: [String],
  })
  @Prop({ type: [String], default: [] })
  contractTypes: string[];

  @ApiProperty({
    description: 'List of eligible employee grades (A, B, C, EXEC)',
    example: ['A', 'B', 'C'],
    type: [String],
  })
  @Prop({ type: [String], default: [] })
  grades: string[];

  @ApiPropertyOptional({
    description:
      'List of eligible departments. Empty array means all departments are eligible.',
    example: [],
    type: [String],
  })
  @Prop({ type: [String], default: [] })
  departments: string[];
}

@Schema({ _id: false })
export class AccrualRules {
  @ApiProperty({
    description:
      'Frequency of leave accrual (monthly, quarterly, annually, none). Defines how often days are added to balance (REQ-040).',
    example: 'monthly',
    enum: ['monthly', 'quarterly', 'annually', 'none'],
  })
  @Prop({
    type: String,
    enum: ['monthly', 'quarterly', 'annually', 'none'],
    required: true,
  })
  accrualType: string;

  @ApiProperty({
    description:
      'Number of days accrued per period. Example: 1.75 days/month = 21 days/year for annual leave.',
    example: 1.75,
  })
  @Prop({ required: true })
  accrualRate: number;

  @ApiProperty({
    description:
      'Whether accrual pauses during unpaid leave (BR 11). Ensures employees do not accrue leave while on unpaid status.',
    example: true,
    default: true,
  })
  @Prop({ default: true })
  pauseDuringUnpaidLeave: boolean;

  @ApiProperty({
    description: 'Whether accrual pauses during employee suspension',
    example: false,
    default: false,
  })
  @Prop({ default: false })
  pauseDuringSuspension: boolean;
}

@Schema({ _id: false })
export class CarryOverRules {
  @ApiProperty({
    description:
      'Maximum total days that can be carried over including current year entitlement (e.g., 45 days cap)',
    example: 45,
  })
  @Prop({ default: 0 })
  maxCarryOverDays: number;

  @ApiProperty({
    description: 'Number of months before carried-over days expire',
    example: 12,
  })
  @Prop({ default: 12 })
  expiryMonths: number;

  @ApiProperty({
    description:
      'Whether to allow unlimited carry-over (overrides maxCarryOverDays)',
    example: false,
    default: false,
  })
  @Prop({ default: false })
  allowUnlimitedCarryOver: boolean;
}

@Schema({ timestamps: true })
export class VacationPackage extends Document {
  @ApiProperty({
    description: 'Unique identifier for the vacation package',
    example: 'PKG-STANDARD',
  })
  @Prop({ required: true, unique: true })
  packageId: string;

  @ApiProperty({
    description:
      'Display name of the package (e.g., Standard Package, Senior Package, Executive Package)',
    example: 'Standard Package',
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    description:
      'Base annual entitlement in days. This is the starting point for leave calculations.',
    example: 21,
  })
  @Prop({ required: true })
  entitlementDays: number;

  @ApiProperty({
    description:
      'Eligibility criteria determining which employees qualify for this package based on tenure, contract type, grade, and department',
    type: EligibilityCriteria,
  })
  @Prop({ type: EligibilityCriteria, required: true })
  eligibilityCriteria: EligibilityCriteria;

  @ApiProperty({
    description:
      'Rules governing how and when leave days are accrued throughout the year (REQ-040, BR 11)',
    type: AccrualRules,
  })
  @Prop({ type: AccrualRules, required: true })
  accrualRules: AccrualRules;

  @ApiProperty({
    description:
      'Rules for carrying over unused days to the next year and when they expire (REQ-041)',
    type: CarryOverRules,
  })
  @Prop({ type: CarryOverRules, required: true })
  carryOverRules: CarryOverRules;

  @ApiProperty({
    description:
      'Criterion for resetting annual balance (hireDate, workReceivingDate, calendarYear). Determines when the leave year starts (REQ-003, REQ-041).',
    example: 'hireDate',
    enum: ['hireDate', 'workReceivingDate', 'calendarYear'],
    default: 'hireDate',
  })
  @Prop({
    type: String,
    enum: ['hireDate', 'workReceivingDate', 'calendarYear'],
    default: 'hireDate',
  })
  resetCriterion: string;

  @ApiProperty({
    description: 'Whether this vacation package is active',
    example: true,
    default: true,
  })
  @Prop({ default: true })
  isActive: boolean;

  @ApiPropertyOptional({
    description:
      'Detailed description of the package including target audience and special rules',
    example: 'Standard vacation package for all permanent employees',
  })
  @Prop()
  description: string;
}

export const VacationPackageSchema =
  SchemaFactory.createForClass(VacationPackage);

// Indexes
VacationPackageSchema.index({ packageId: 1 });
VacationPackageSchema.index({ isActive: 1 });
