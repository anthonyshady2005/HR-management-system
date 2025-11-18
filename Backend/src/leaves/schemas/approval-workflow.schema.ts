import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type ApprovalWorkflowDocument = HydratedDocument<ApprovalWorkflow>;

@Schema({ _id: false })
export class ApprovalLevel {
  @ApiProperty({
    description: 'Sequential level in approval chain (1, 2, 3, etc.)',
    example: 1,
  })
  @Prop({ required: true })
  level: number;

  @ApiProperty({
    description: 'Role type required for this approval level',
    example: 'lineManager',
    enum: ['lineManager', 'departmentHead', 'hrAdmin', 'hrManager'],
  })
  @Prop({
    type: String,
    enum: ['lineManager', 'departmentHead', 'hrAdmin', 'hrManager'],
    required: true,
  })
  roleType: string;

  @ApiProperty({
    description: 'Whether this approval level is mandatory',
    example: true,
    default: true,
  })
  @Prop({ default: true })
  isRequired: boolean;

  @ApiProperty({
    description:
      'Whether this approver can override previous rejections (REQ-026: HR override)',
    example: false,
    default: false,
  })
  @Prop({ default: false })
  canOverride: boolean;

  @ApiProperty({
    description: 'Hours before auto-escalation kicks in (BR 28: 48-hour rule)',
    example: 48,
    default: 48,
  })
  @Prop({ default: 48 })
  escalationHours: number;

  @ApiProperty({
    description: 'Whether to automatically escalate on timeout',
    example: false,
    default: false,
  })
  @Prop({ default: false })
  autoEscalateOnTimeout: boolean;

  @ApiPropertyOptional({
    description: 'Role to escalate to if timeout occurs',
    example: 'departmentHead',
  })
  @Prop()
  escalateTo: string;
}

@Schema({ timestamps: true })
export class ApprovalWorkflow extends Document {
  @ApiProperty({
    description: 'Unique workflow identifier',
    example: 'WF-DEFAULT',
  })
  @Prop({ required: true, unique: true })
  workflowId: string;

  @ApiPropertyOptional({
    description:
      'Leave type this workflow applies to. Null means default workflow for all types (REQ-009).',
    example: null,
  })
  @Prop({ type: Types.ObjectId, ref: 'LeaveType' })
  leaveTypeId: Types.ObjectId;

  @ApiProperty({
    description:
      'Sequential approval levels defining the complete approval chain',
    type: [ApprovalLevel],
  })
  @Prop({ type: [ApprovalLevel], required: true })
  approvalLevels: ApprovalLevel[];

  @ApiProperty({
    description:
      'Whether managers can delegate approval authority (REQ-023: delegation support)',
    example: true,
    default: true,
  })
  @Prop({ default: true })
  delegationEnabled: boolean;

  @ApiProperty({
    description: 'Whether to send notification when request is submitted',
    example: true,
    default: true,
  })
  @Prop({ default: true })
  notifyOnSubmission: boolean;

  @ApiProperty({
    description: 'Whether to send notification when request is approved',
    example: true,
    default: true,
  })
  @Prop({ default: true })
  notifyOnApproval: boolean;

  @ApiProperty({
    description: 'Whether to send notification when request is rejected',
    example: true,
    default: true,
  })
  @Prop({ default: true })
  notifyOnRejection: boolean;

  @ApiProperty({
    description: 'Whether this workflow is active',
    example: true,
    default: true,
  })
  @Prop({ default: true })
  isActive: boolean;
}

export const ApprovalWorkflowSchema =
  SchemaFactory.createForClass(ApprovalWorkflow);

// Indexes
ApprovalWorkflowSchema.index({ workflowId: 1 });
ApprovalWorkflowSchema.index({ leaveTypeId: 1 });
