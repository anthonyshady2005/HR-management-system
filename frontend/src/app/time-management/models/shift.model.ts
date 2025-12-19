export enum PunchPolicy {
  MULTIPLE = 'MULTIPLE',
  FIRST_LAST = 'FIRST_LAST',
  ONLY_FIRST = 'ONLY_FIRST',
}

export enum ShiftAssignmentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export interface ShiftType {
  _id: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface Shift {
  _id: string;
  name: string;
  shiftType: string;
  shiftTypeName?: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  punchPolicy: PunchPolicy;
  graceInMinutes: number;
  graceOutMinutes: number;
  requiresApprovalForOvertime: boolean;
  active: boolean;
}

export interface ShiftAssignment {
  _id: string;
  employeeId: string;
  employeeName?: string;
  shiftId: string;
  shiftName?: string;
  startDate: string;
  endDate?: string;
  status: ShiftAssignmentStatus;
  assignedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScheduleRule {
  _id: string;
  name: string;
  description?: string;
  shiftId: string;
  employeeId?: string;
  departmentId?: string;
  positionId?: string;
  dayOfWeek?: number[]; // 0-6 (Sunday-Saturday)
  pattern?: string;     // ✅ ADD THIS
  active: boolean;
}

