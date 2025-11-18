import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type LeaveRequestDocument = HydratedDocument<LeaveRequest>;

@Schema({ _id: false })
export class LeaveDocument {
  @ApiProperty({
    description: 'URL or file path to the uploaded document',
    example: '/uploads/medical-cert-001.pdf',
  })
  @Prop({ required: true })
  documentUrl: string;

  @ApiProperty({
    description:
      'Type of document (e.g., Medical Certificate, Marriage Certificate)',
    example: 'Medical Certificate',
  })
  @Prop({ required: true })
  documentType: string;

  @ApiPropertyOptional({
    description: 'Original file name',
    example: 'medical-cert-001.pdf',
  })
  @Prop()
  fileName: string;

  @ApiProperty({
    description: 'Timestamp when document was uploaded',
    example: '2025-11-17T10:30:00.000Z',
  })
  @Prop({ default: Date.now })
  uploadedAt: Date;
}

@Schema({ _id: false })
export class ApprovalStep {
  @ApiProperty({
    description: 'Employee ID of the approver (manager or HR admin)',
    example: 'EMP010',
  })
  @Prop({ required: true })
  approverId: string;

  @ApiProperty({
    description:
      'Role of approver in the approval chain (lineManager, hrAdmin, hrManager)',
    example: 'lineManager',
    enum: ['lineManager', 'hrAdmin', 'hrManager'],
  })
  @Prop({
    type: String,
    enum: ['lineManager', 'hrAdmin', 'hrManager'],
    required: true,
  })
  role: string;

  @ApiProperty({
    description: 'Action taken by approver (pending, approved, rejected)',
    example: 'pending',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  @Prop({
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  action: string;

  @ApiPropertyOptional({
    description: 'Comments provided by approver',
    example: 'Approved - team coverage confirmed',
  })
  @Prop()
  comments: string;

  @ApiPropertyOptional({
    description: 'Timestamp when action was taken',
    example: '2025-11-17T11:00:00.000Z',
  })
  @Prop()
  actionDate: Date;

  @ApiProperty({
    description:
      'Whether this approval was auto-escalated due to timeout (BR 28: 48-hour escalation rule)',
    example: false,
    default: false,
  })
  @Prop({ default: false })
  isEscalated: boolean;

  @ApiPropertyOptional({
    description: 'Timestamp when escalation occurred',
    example: '2025-11-19T11:00:00.000Z',
  })
  @Prop()
  escalatedAt: Date;
}

@Schema({ _id: false })
export class ExcessDaysHandling {
  @ApiProperty({
    description: 'Number of days exceeding available balance',
    example: 0,
    default: 0,
  })
  @Prop({ default: 0 })
  excessDays: number;

  @ApiProperty({
    description: 'Whether excess days were converted to unpaid leave (BR 29)',
    example: false,
    default: false,
  })
  @Prop({ default: false })
  convertedToUnpaid: boolean;

  @ApiProperty({
    description: 'Number of paid days from balance',
    example: 5,
    default: 0,
  })
  @Prop({ default: 0 })
  paidDays: number;

  @ApiProperty({
    description: 'Number of unpaid days (excess)',
    example: 0,
    default: 0,
  })
  @Prop({ default: 0 })
  unpaidDays: number;
}

@Schema({ _id: false })
export class ValidationResult {
  @ApiProperty({
    description: 'Overall validation status',
    example: true,
    default: true,
  })
  @Prop({ default: true })
  isValid: boolean;

  @ApiProperty({
    description: 'List of validation errors that prevent submission',
    example: [],
    type: [String],
  })
  @Prop({ type: [String], default: [] })
  errors: string[];

  @ApiProperty({
    description: 'List of validation warnings (non-blocking)',
    example: ['Insufficient balance - excess will be unpaid'],
    type: [String],
  })
  @Prop({ type: [String], default: [] })
  warnings: string[];

  @ApiPropertyOptional({
    description: 'Timestamp when validation was performed',
    example: '2025-11-17T10:00:00.000Z',
  })
  @Prop()
  validatedAt: Date;
}

@Schema({ timestamps: true })
export class LeaveRequest extends Document {
  @ApiProperty({
    description: 'Unique leave request identifier (auto-generated)',
    example: 'LR-2025-000001',
  })
  @Prop({ required: true, unique: true })
  requestId: string;

  @ApiProperty({
    description: 'Employee ID who submitted the request',
    example: 'EMP001',
  })
  @Prop({ required: true })
  employeeId: string;

  @ApiProperty({
    description: 'Reference to leave type (Annual, Sick, etc.)',
    example: '507f1f77bcf86cd799439011',
  })
  @Prop({ type: Types.ObjectId, ref: 'LeaveType', required: true })
  leaveTypeId: Types.ObjectId;

  @ApiProperty({
    description: 'Leave start date (inclusive)',
    example: '2025-12-01',
  })
  @Prop({ required: true })
  startDate: Date;

  @ApiProperty({
    description: 'Leave end date (inclusive)',
    example: '2025-12-05',
  })
  @Prop({ required: true })
  endDate: Date;

  @ApiProperty({
    description:
      'Total working days excluding weekends and holidays (BR 23: net days calculation)',
    example: 5,
  })
  @Prop({ required: true })
  totalDays: number;

  @ApiProperty({
    description: 'Reason for leave request',
    example: 'Family vacation',
  })
  @Prop({ required: true })
  reason: string;

  @ApiProperty({
    description:
      'Whether this is a retroactive request submitted after leave was taken (REQ-031: post-leave grace period)',
    example: false,
    default: false,
  })
  @Prop({ default: false })
  isPostLeave: boolean;

  @ApiPropertyOptional({
    description: 'Timestamp when request was submitted',
    example: '2025-11-17T09:30:00.000Z',
  })
  @Prop()
  submittedAt: Date;

  @ApiProperty({
    description:
      'Supporting documents uploaded with request (REQ-016, REQ-028)',
    type: [LeaveDocument],
  })
  @Prop({ type: [LeaveDocument], default: [] })
  documents: LeaveDocument[];

  @ApiProperty({
    description: 'Current status of the leave request',
    example: 'pendingManagerApproval',
    enum: [
      'draft',
      'pendingManagerApproval',
      'managerApproved',
      'managerRejected',
      'pendingHRApproval',
      'hrApproved',
      'hrRejected',
      'cancelled',
      'completed',
    ],
  })
  @Prop({
    type: String,
    enum: [
      'draft',
      'pendingManagerApproval',
      'managerApproved',
      'managerRejected',
      'pendingHRApproval',
      'hrApproved',
      'hrRejected',
      'cancelled',
      'completed',
    ],
    default: 'draft',
  })
  status: string;

  @ApiProperty({
    description:
      'Multi-level approval chain built from organizational structure (REQ-020, REQ-021, REQ-022)',
    type: [ApprovalStep],
  })
  @Prop({ type: [ApprovalStep], default: [] })
  approvalChain: ApprovalStep[];

  @ApiPropertyOptional({
    description:
      'Handling of days exceeding available balance (BR 29: excess to unpaid conversion)',
    type: ExcessDaysHandling,
  })
  @Prop({ type: ExcessDaysHandling })
  excessDaysHandling: ExcessDaysHandling;

  @ApiPropertyOptional({
    description:
      'Validation results from submission checks (BR 8, BR 31, BR 28)',
    type: ValidationResult,
  })
  @Prop({ type: ValidationResult })
  validationResult: ValidationResult;

  @ApiPropertyOptional({
    description:
      'Snapshot of employee balance at time of submission for audit trail',
    example: 15,
  })
  @Prop()
  balanceAtSubmission: number;

  @ApiProperty({
    description:
      'Whether this request overlaps with existing approved leaves (BR 31)',
    example: false,
    default: false,
  })
  @Prop({ default: false })
  hasOverlap: boolean;

  @ApiPropertyOptional({
    description: 'Details of overlapping leave requests',
    example: 'Overlaps with LR-2025-000050',
  })
  @Prop()
  overlapDetails: string;

  @ApiProperty({
    description:
      'Whether this request creates team scheduling conflicts (BR 28)',
    example: false,
    default: false,
  })
  @Prop({ default: false })
  hasTeamConflict: boolean;

  @ApiPropertyOptional({
    description: 'Details of team conflicts',
    example: 'Two team members already on leave during this period',
  })
  @Prop()
  conflictDetails: string;

  @ApiPropertyOptional({
    description: 'Reason for cancellation if cancelled by employee',
    example: 'Plans changed',
  })
  @Prop()
  cancellationReason: string;

  @ApiPropertyOptional({
    description: 'Timestamp when request was cancelled',
    example: '2025-11-18T14:00:00.000Z',
  })
  @Prop()
  cancelledAt: Date;

  @ApiPropertyOptional({
    description: 'Employee ID who cancelled the request',
    example: 'EMP001',
  })
  @Prop()
  cancelledBy: string;

  @ApiProperty({
    description:
      'Whether HR overrode manager decision (REQ-026: HR override capability)',
    example: false,
    default: false,
  })
  @Prop({ default: false })
  isHROverride: boolean;

  @ApiPropertyOptional({
    description: 'Reason for HR override',
    example: 'Emergency family situation',
  })
  @Prop()
  overrideReason: string;

  @ApiPropertyOptional({
    description: 'HR admin who performed override',
    example: 'HR-ADMIN-001',
  })
  @Prop()
  overriddenBy: string;

  @ApiPropertyOptional({
    description: 'Timestamp of override action',
    example: '2025-11-17T15:00:00.000Z',
  })
  @Prop()
  overriddenAt: Date;

  @ApiProperty({
    description:
      'Whether attendance was blocked in Time Management subsystem (REQ-042)',
    example: false,
    default: false,
  })
  @Prop({ default: false })
  syncedToTimeManagement: boolean;

  @ApiPropertyOptional({
    description: 'Timestamp of sync to Time Management',
    example: '2025-11-17T12:00:00.000Z',
  })
  @Prop()
  syncedToTimeManagementAt: Date;

  @ApiProperty({
    description: 'Whether payroll item was created (BR 6: payCode integration)',
    example: false,
    default: false,
  })
  @Prop({ default: false })
  syncedToPayroll: boolean;

  @ApiPropertyOptional({
    description: 'Timestamp of sync to Payroll',
    example: '2025-11-17T12:00:00.000Z',
  })
  @Prop()
  syncedToPayrollAt: Date;
}

export const LeaveRequestSchema = SchemaFactory.createForClass(LeaveRequest);

// Indexes
LeaveRequestSchema.index({ requestId: 1 });
LeaveRequestSchema.index({ employeeId: 1, status: 1 });
LeaveRequestSchema.index({ status: 1 });
LeaveRequestSchema.index({ startDate: 1, endDate: 1 });
LeaveRequestSchema.index({
  'approvalChain.approverId': 1,
  'approvalChain.action': 1,
});
LeaveRequestSchema.index({ submittedAt: -1 });
