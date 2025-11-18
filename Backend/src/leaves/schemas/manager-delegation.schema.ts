import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type ManagerDelegationDocument = HydratedDocument<ManagerDelegation>;

@Schema({ timestamps: true })
export class ManagerDelegation extends Document {
  @ApiProperty({
    description: 'Unique delegation identifier',
    example: 'DEL-2025-001',
  })
  @Prop({ required: true, unique: true })
  delegationId: string;

  @ApiProperty({
    description: 'Employee ID of the original manager delegating authority',
    example: 'EMP010',
  })
  @Prop({ required: true })
  managerId: string;

  @ApiProperty({
    description:
      'Employee ID of the person receiving delegation authority (REQ-023)',
    example: 'EMP001',
  })
  @Prop({ required: true })
  delegateId: string;

  @ApiProperty({
    description: 'Start date of delegation period (inclusive)',
    example: '2025-12-01',
  })
  @Prop({ required: true })
  startDate: Date;

  @ApiProperty({
    description: 'End date of delegation period (inclusive)',
    example: '2025-12-15',
  })
  @Prop({ required: true })
  endDate: Date;

  @ApiPropertyOptional({
    description: 'Reason for delegation (e.g., Annual leave, Business trip)',
    example: 'Annual leave - overseas trip',
  })
  @Prop()
  reason: string;

  @ApiProperty({
    description: 'Whether this delegation is currently active',
    example: true,
    default: true,
  })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether delegate can approve leave requests',
    example: true,
    default: false,
  })
  @Prop({ default: false })
  canApprove: boolean;

  @ApiProperty({
    description: 'Whether delegate can reject leave requests',
    example: true,
    default: false,
  })
  @Prop({ default: false })
  canReject: boolean;

  @ApiProperty({
    description: 'Whether to notify delegate when delegation becomes active',
    example: true,
    default: true,
  })
  @Prop({ default: true })
  notifyDelegate: boolean;
}

export const ManagerDelegationSchema =
  SchemaFactory.createForClass(ManagerDelegation);

// Indexes (REQ-023)
ManagerDelegationSchema.index({ managerId: 1, isActive: 1 });
ManagerDelegationSchema.index({ delegateId: 1, isActive: 1 });
ManagerDelegationSchema.index({ startDate: 1, endDate: 1 });
