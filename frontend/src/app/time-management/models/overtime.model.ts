// models/rules.model.ts

// ===================== OVERTIME RULE =====================
export interface OvertimeRule {
  _id: string;
  name: string;
  description?: string;
  minHours: number;
  maxHours?: number;
  multiplier: number; // e.g., 1.5 for time and a half
  requiresApproval: boolean;
  active: boolean;
  approved: boolean;
}

export class OvertimeRuleClass implements OvertimeRule {
  _id: string;
  name: string;
  description?: string;
  minHours: number;
  maxHours?: number;
  multiplier: number;
  requiresApproval: boolean;
  active: boolean;
  approved: boolean;

  constructor(data: Partial<OvertimeRule> = {}) {
    this._id = data._id || '';
    this.name = data.name || '';
    this.description = data.description;
    this.minHours = data.minHours ?? 0;
    this.maxHours = data.maxHours;
    this.multiplier = data.multiplier ?? 1;
    this.requiresApproval = data.requiresApproval ?? false;
    this.active = data.active ?? true;
    this.approved = data.approved ?? false;
  }
}

// ===================== LATENESS RULE =====================
export interface LatenessRule {
  _id: string;
  name: string;
  description?: string;
  graceMinutes: number;
  penaltyType: 'deduction' | 'warning' | 'escalation';
  penaltyAmount?: number;
  active: boolean;
}

export class LatenessRuleClass implements LatenessRule {
  _id: string;
  name: string;
  description?: string;
  graceMinutes: number;
  penaltyType: 'deduction' | 'warning' | 'escalation';
  penaltyAmount?: number;
  active: boolean;

  constructor(data: Partial<LatenessRule> = {}) {
    this._id = data._id || '';
    this.name = data.name || '';
    this.description = data.description;
    this.graceMinutes = data.graceMinutes ?? 0;
    this.penaltyType = data.penaltyType || 'deduction';
    this.penaltyAmount = data.penaltyAmount ?? 0;
    this.active = data.active ?? true;
  }
}

// ===================== SUMMARIES =====================
export interface OvertimeSummary {
  employeeId: string;
  employeeName?: string;
  totalOvertimeHours: number;
  totalOvertimeMinutes: number;
  approvedHours: number;
  pendingHours: number;
  period: {
    start: string;
    end: string;
  };
}

export interface PenaltySummary {
  employeeId: string;
  employeeName?: string;
  totalPenalties: number;
  totalDeductions: number;
  latenessCount: number;
  period: {
    start: string;
    end: string;
  };
}
