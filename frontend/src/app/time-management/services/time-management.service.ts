"use client";

import { api } from "@/lib/api";
import {
  Holiday,
  OvertimeRule,
  LatenessRule,
  ShiftType,
  Shift,
  ShiftAssignment,
  ScheduleRule,
  ShiftAssignmentStatus,
} from "../models";

export class TimeManagementService {
  private baseUrl = "/time-management";

  /* =====================================================
     LOOKUPS (EMPLOYEES / DEPARTMENTS / POSITIONS)
  ===================================================== */

  async getAllEmployees() {
    const res = await api.get(`${this.baseUrl}/lookup/employees`);
    return res.data?.data ?? res.data;
  }

  async getAllDepartments() {
    const res = await api.get(`${this.baseUrl}/lookup/departments`);
    return res.data?.data ?? res.data;
  }

  async getAllPositions() {
    const res = await api.get(`${this.baseUrl}/lookup/positions`);
    return res.data?.data ?? res.data;
  }

  /* =====================================================
     SHIFT TYPES
  ===================================================== */

  async getAllShiftTypes(): Promise<ShiftType[]> {
    const res = await api.get(`${this.baseUrl}/shift-types`);
    return res.data;
  }

  async getShiftTypeById(id: string): Promise<ShiftType> {
    const res = await api.get(`${this.baseUrl}/shift-types/${id}`);
    return res.data;
  }

  async createShiftType(data: { name: string }): Promise<ShiftType> {
    const res = await api.post(`${this.baseUrl}/shift-types`, data);
    return res.data;
  }

  async updateShiftType(
    id: string,
    data: Partial<ShiftType>,
  ): Promise<ShiftType> {
    const res = await api.patch(`${this.baseUrl}/shift-types/${id}`, data);
    return res.data;
  }

  async deactivateShiftType(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/shift-types/${id}`);
  }

  /* =====================================================
     SHIFTS
  ===================================================== */

  async getAllShifts(): Promise<Shift[]> {
    const res = await api.get(`${this.baseUrl}/shifts`);
    return res.data;
  }

  async getShiftById(id: string): Promise<Shift> {
    const res = await api.get(`${this.baseUrl}/shifts/${id}`);
    return res.data;
  }

  async createShift(data: {
    name: string;
    shiftType: string;
    startTime: string;
    endTime: string;
    // backend also supports graceInMinutes / graceOutMinutes / punchPolicy
    // but they are optional from the FE
    graceInMinutes?: number;
    graceOutMinutes?: number;
    punchPolicy?: string;
  }): Promise<Shift> {
    const res = await api.post(`${this.baseUrl}/shifts`, data);
    return res.data;
  }

  async updateShift(id: string, data: Partial<Shift>): Promise<Shift> {
    const res = await api.patch(`${this.baseUrl}/shifts/${id}`, data);
    return res.data;
  }

  async deactivateShift(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/shifts/${id}`);
  }

  /* =====================================================
     SHIFT ASSIGNMENTS (ALIGNED WITH YOUR CONTROLLER)
  ===================================================== */

  async getShiftAssignments(params?: {
    employeeId?: string;
    status?: string;
    start?: string;
    end?: string;
  }): Promise<ShiftAssignment[]> {
    const res = await api.get(`${this.baseUrl}/shift-assignments`, { params });
    return res.data;
  }

  async getShiftAssignmentById(id: string): Promise<ShiftAssignment> {
    const res = await api.get(`${this.baseUrl}/shift-assignments/${id}`);
    return res.data;
  }

  async assignShiftToEmployee(data: {
    employeeId: string;
    shiftId: string;
    startDate: string;
    endDate?: string;
    scheduleRuleId?: string;
  }): Promise<ShiftAssignment> {
    const res = await api.post(
      `${this.baseUrl}/shift-assignments/employee`,
      data,
    );
    return res.data;
  }

  async assignShiftToDepartment(
    departmentId: string,
    data: {
      shiftId: string;
      startDate: string;
      endDate?: string;
      scheduleRuleId?: string; // ✅ NEW
    },
  ): Promise<ShiftAssignment[]> {
    const res = await api.post(
      `${this.baseUrl}/shift-assignments/department/${departmentId}`,
      data,
    );
    return res.data;
  }

  async assignShiftToPosition(
    positionId: string,
    data: {
      shiftId: string;
      startDate: string;
      endDate?: string;
      scheduleRuleId?: string; // ✅ NEW
    },
  ): Promise<ShiftAssignment[]> {
    const res = await api.post(
      `${this.baseUrl}/shift-assignments/position/${positionId}`,
      data,
    );
    return res.data;
  }

  async updateShiftAssignment(
    id: string,
    data: {
      shiftId?: string;
      startDate?: string;
      endDate?: string;
      scheduleRuleId?: string; // ✅ NEW
    },
  ): Promise<ShiftAssignment> {
    const res = await api.patch(
      `${this.baseUrl}/shift-assignments/${id}`,
      data,
    );
    return res.data;
  }

  async revokeShiftAssignment(id: string): Promise<ShiftAssignment> {
    const res = await api.patch(
      `${this.baseUrl}/shift-assignments/${id}/revoke`,
    );
    return res.data;
  }

  async deleteShiftAssignment(id: string): Promise<void> {
    await this.revokeShiftAssignment(id);
  }

  async permanentlyDeleteShiftAssignment(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/shift-assignments/${id}/permanent`);
  }

  async updateShiftAssignmentStatus(
    id: string,
    status: ShiftAssignmentStatus,
  ): Promise<ShiftAssignment> {
    const res = await api.patch(
      `${this.baseUrl}/shift-assignments/${id}/status`,
      { status },
    );
    return res.data;
  }

  async expireShiftAssignments(): Promise<void> {
    await api.post(`${this.baseUrl}/shift-assignments/expire`);
  }

  /* =====================================================
     SHIFT EXPIRY NOTIFICATIONS
  ===================================================== */

  async notifyUpcomingShiftExpiry(
    daysBefore: number = 3,
  ): Promise<{
    notifiedAdmins?: number;
    records?: number;
    notificationsCreated?: number;
    message?: string;
  }> {
    const res = await api.post(
      `${this.baseUrl}/shift-assignments/notify-expiry`,
      {},
      { params: { daysBefore } },
    );
    return res.data;
  }

  async handleShiftExpiryCron(): Promise<{ message: string }> {
    const res = await api.post(
      `${this.baseUrl}/shift-assignments/expiry-cycle`,
    );
    return res.data;
  }

  async getShiftExpiryNotifications(
    limit: number = 5,
    offset: number = 0,
  ): Promise<
    Array<{
      _id: string;
      employeeId: string;
      employeeName: string;
      shiftId: string;
      shiftName: string;
      expiryDate: string;
      daysUntilExpiry: number;
      createdAt: string;
    }>
  > {
    const res = await api.get(`${this.baseUrl}/notifications/shift-expiry`, {
      params: { limit, offset },
    });
    return res.data;
  }

  /* =====================================================
     SCHEDULE RULES
  ===================================================== */

  async getScheduleRules(): Promise<ScheduleRule[]> {
    const res = await api.get(`${this.baseUrl}/schedule-rules`);
    return res.data;
  }

  async getScheduleRuleById(id: string): Promise<ScheduleRule> {
    const res = await api.get(`${this.baseUrl}/schedule-rules/${id}`);
    return res.data;
  }

  async createScheduleRule(data: {
    name: string;
    pattern: string;
  }): Promise<ScheduleRule> {
    const res = await api.post(`${this.baseUrl}/schedule-rules`, data);
    return res.data;
  }

  async updateScheduleRule(
    id: string,
    data: Partial<ScheduleRule>,
  ): Promise<ScheduleRule> {
    const res = await api.patch(`${this.baseUrl}/schedule-rules/${id}`, data);
    return res.data;
  }

  async deactivateScheduleRule(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/schedule-rules/${id}`);
  }

  /* =====================================================
     HOLIDAYS
  ===================================================== */

  async getHolidays(params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
  }): Promise<Holiday[]> {
    const res = await api.get(`${this.baseUrl}/holidays`, { params });
    return res.data;
  }

  async createHoliday(data: {
    type: string;
    startDate: string;
    endDate?: string;
    name?: string;
  }): Promise<Holiday> {
    const res = await api.post(`${this.baseUrl}/holidays`, data);
    return res.data;
  }

  async updateHoliday(
    id: string,
    data: Partial<Holiday>,
  ): Promise<Holiday> {
    const res = await api.patch(`${this.baseUrl}/holidays/${id}`, data);
    return res.data;
  }

  /* =====================================================
     OVERTIME & LATENESS (READ ONLY)
  ===================================================== */

  async getOvertimeRules(params?: { active?: boolean }): Promise<OvertimeRule[]> {
    const res = await api.get(`${this.baseUrl}/overtime-rules`, { params });
    return res.data;
  }

  async getLatenessRules(params?: { active?: boolean }): Promise<LatenessRule[]> {
    const res = await api.get(`${this.baseUrl}/lateness-rules`, { params });
    return res.data;
  }
}

export const timeManagementService = new TimeManagementService();
