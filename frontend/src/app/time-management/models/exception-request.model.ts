export enum TimeExceptionType {
  MISSED_PUNCH = 'MISSED_PUNCH',
  LATE = 'LATE',
  EARLY_LEAVE = 'EARLY_LEAVE',
  SHORT_TIME = 'SHORT_TIME',
  OVERTIME_REQUEST = 'OVERTIME_REQUEST',
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT',
}

export enum TimeExceptionStatus {
  OPEN = 'OPEN',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED',
  RESOLVED = 'RESOLVED',
}

export enum CorrectionRequestStatus {
  SUBMITTED = 'SUBMITTED',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED',
}

export interface TimeException {
  _id: string;
  employeeId: string;
  employeeName?: string;
  type: TimeExceptionType;
  attendanceRecordId: string;
  assignedTo: string;
  assignedToName?: string;
  status: TimeExceptionStatus;
  reason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceCorrectionRequest {
  _id: string;
  employeeId: string;
  employeeName?: string;
  attendanceRecordId: string;
  reason: string;
  status: CorrectionRequestStatus;
  reviewerId?: string;
  reviewerName?: string;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApprovalLog {
  _id: string;
  exceptionId: string;
  reviewerId: string;
  reviewerName?: string;
  action: 'approve' | 'reject' | 'escalate';
  comment?: string;
  timestamp: string;
}

