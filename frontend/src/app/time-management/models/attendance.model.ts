export enum PunchType {
  IN = 'IN',
  OUT = 'OUT',
}

export interface Punch {
  type: PunchType;
  time: string; // ISO date string
}

export interface AttendanceRecord {
  _id: string;
  employeeId: string;
  punches: Punch[];
  totalWorkMinutes: number;
  hasMissedPunch: boolean;
  exceptionIds: string[];
  finalisedForPayroll: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceRecordListItem {
  _id: string;
  employeeId: string;
  employeeName?: string;
  date: string;
  punches: Punch[];
  totalWorkMinutes: number;
  hasMissedPunch: boolean;
  status: 'present' | 'absent' | 'late' | 'early_leave';
}

export interface AttendanceStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  onLeaveToday: number;
  averageHours: number;
}

