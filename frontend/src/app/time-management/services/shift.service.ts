"use client";

import { api } from "@/lib/api";
import {
  Shift,
  ShiftType,
  ShiftAssignment,
  ScheduleRule,
} from "../models";

/* =====================================
   ENUMS & SHARED TYPES
===================================== */

export type ShiftAssignmentStatus =
  | "PENDING"
  | "APPROVED"
  | "CANCELLED"
  | "EXPIRED";

export type AssignShiftPayload = {
  shiftId: string;
  startDate: string;
  endDate?: string;
};

/* =====================================
   SHIFT SERVICE
===================================== */

export class ShiftService {
  private baseUrl = "/time-management";

  /* =====================================
     SHIFT TYPES
  ===================================== */

  async getShiftTypes(): Promise<ShiftType[]> {
    const res = await api.get(`${this.baseUrl}/shift-types`);
    return res.data;
  }

  async createShiftType(data: {
    name: string;
    active?: boolean;
  }): Promise<ShiftType> {
    const res = await api.post(`${this.baseUrl}/shift-types`, data);
    return res.data;
  }

  async updateShiftType(
    id: string,
    data: Partial<ShiftType>,
  ): Promise<ShiftType> {
    const res = await api.patch(
      `${this.baseUrl}/shift-types/${id}`,
      data,
    );
    return res.data;
  }

  async deactivateShiftType(id: string): Promise<ShiftType> {
    const res = await api.patch(
      `${this.baseUrl}/shift-types/${id}`,
      { active: false },
    );
    return res.data;
  }

  /* =====================================
     SHIFTS
  ===================================== */

  async getShifts(): Promise<Shift[]> {
    const res = await api.get(`${this.baseUrl}/shifts`);
    return res.data;
  }

  async createShift(data: {
    name: string;
    shiftType: string;
    startTime: string;
    endTime: string;
    punchPolicy?: string;
    graceInMinutes?: number;
    graceOutMinutes?: number;
    requiresApprovalForOvertime?: boolean;
  }): Promise<Shift> {
    const res = await api.post(`${this.baseUrl}/shifts`, data);
    return res.data;
  }

  async updateShift(
    id: string,
    data: Partial<Shift>,
  ): Promise<Shift> {
    const res = await api.patch(`${this.baseUrl}/shifts/${id}`, data);
    return res.data;
  }

  async deactivateShift(id: string): Promise<Shift> {
    const res = await api.patch(
      `${this.baseUrl}/shifts/${id}`,
      { active: false },
    );
    return res.data;
  }

  /* =====================================
     USER STORY 1 — SHIFT ASSIGNMENTS
  ===================================== */

  async assignShiftToEmployee(data: {
    employeeId: string;
    shiftId: string;
    startDate: string;
    endDate?: string;
  }): Promise<ShiftAssignment> {
    const res = await api.post(
      `${this.baseUrl}/shift-assignments/employee`,
      data,
    );
    return res.data;
  }

  async assignShiftToDepartment(
    departmentId: string,
    data: AssignShiftPayload,
  ): Promise<ShiftAssignment[]> {
    const res = await api.post(
      `${this.baseUrl}/shift-assignments/department/${departmentId}`,
      data,
    );

    // backend wraps assignments
    return res.data.assignments ?? [];
  }

  async assignShiftToPosition(
    positionId: string,
    data: AssignShiftPayload,
  ): Promise<ShiftAssignment[]> {
    const res = await api.post(
      `${this.baseUrl}/shift-assignments/position/${positionId}`,
      data,
    );
    return res.data;
  }

  async updateShiftAssignmentStatus(
    assignmentId: string,
    status: ShiftAssignmentStatus,
  ): Promise<ShiftAssignment> {
    const res = await api.patch(
      `${this.baseUrl}/shift-assignments/${assignmentId}`,
      { status },
    );
    return res.data;
  }

  async expireShiftAssignments(): Promise<void> {
    await api.post(`${this.baseUrl}/shift-assignments/expire`);
  }

  async getShiftAssignments(params?: {
    employeeId?: string;
    status?: ShiftAssignmentStatus;
  }): Promise<ShiftAssignment[]> {
    const res = await api.get(
      `${this.baseUrl}/shift-assignments`,
      { params },
    );
    return res.data;
  }

  /* =====================================
     SCHEDULE RULES
  ===================================== */

  async getScheduleRules(): Promise<ScheduleRule[]> {
    const res = await api.get(`${this.baseUrl}/schedule-rules`);
    return res.data;
  }

  async createScheduleRule(data: {
    name: string;
    pattern: string;
    active?: boolean;
  }): Promise<ScheduleRule> {
    const res = await api.post(`${this.baseUrl}/schedule-rules`, data);
    return res.data;
  }

  async updateScheduleRule(
    id: string,
    data: Partial<ScheduleRule>,
  ): Promise<ScheduleRule> {
    const res = await api.patch(
      `${this.baseUrl}/schedule-rules/${id}`,
      data,
    );
    return res.data;
  }

  async deactivateScheduleRule(id: string): Promise<ScheduleRule> {
    const res = await api.patch(
      `${this.baseUrl}/schedule-rules/${id}`,
      { active: false },
    );
    return res.data;
  }
}

/* =====================================
   EXPORT SINGLETON
===================================== */

export const shiftService = new ShiftService();
