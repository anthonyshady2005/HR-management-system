"use client";

import { api } from "@/lib/api";
import { OvertimeRule } from "../models";

export class OvertimeService {
  private baseUrl = "/time-management";

  /* =====================================================
     LIST OVERTIME RULES
  ===================================================== */
  async getOvertimeRules(params?: { active?: boolean }): Promise<OvertimeRule[]> {
    const res = await api.get(`${this.baseUrl}/overtime-rules`, { params });
    return res.data;
  }

  /* =====================================================
     CREATE OVERTIME RULE
  ===================================================== */
  async createOvertimeRule(data: { name: string; description?: string }): Promise<OvertimeRule> {
    const res = await api.post(`${this.baseUrl}/overtime-rules`, data);
    return res.data;
  }

  /* =====================================================
     UPDATE OVERTIME RULE
  ===================================================== */
  async updateOvertimeRule(
    id: string,
    data: Partial<{ name: string; description?: string; active?: boolean }>
  ): Promise<OvertimeRule> {
    const res = await api.patch(`${this.baseUrl}/overtime-rules/${id}`, data);
    return res.data;
  }

  /* =====================================================
     APPROVE OVERTIME RULE
  ===================================================== */
  async approveOvertimeRule(id: string): Promise<OvertimeRule> {
    const res = await api.post(`${this.baseUrl}/overtime-rules/${id}/approve`);
    return res.data;
  }

  /* =====================================================
     TOGGLE (ACTIVATE / DEACTIVATE) OVERTIME RULE
  ===================================================== */
  async toggleOvertimeRule(id: string, activate: boolean): Promise<OvertimeRule> {
    const res = await api.post(`${this.baseUrl}/overtime-rules/${id}/toggle`, { activate });
    return res.data;
  }
}

export const overtimeService = new OvertimeService();
