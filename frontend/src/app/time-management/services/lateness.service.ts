"use client";

import { api } from "@/lib/api";
import { LatenessRule } from "../models/lateness-rule";

export class LatenessService {
  private baseUrl = "/time-management";

  async getLatenessRules(params?: { active?: boolean }): Promise<LatenessRule[]> {
    const res = await api.get(`${this.baseUrl}/lateness-rules`, { params });
    return res.data.map((r: any) => new LatenessRule(r));
  }

  async createLatenessRule(data: Partial<LatenessRule>): Promise<LatenessRule> {
    const res = await api.post(`${this.baseUrl}/lateness-rules`, data);
    return new LatenessRule(res.data);
  }

  async updateLatenessRule(id: string, data: Partial<LatenessRule>): Promise<LatenessRule> {
    const res = await api.patch(`${this.baseUrl}/lateness-rules/${id}`, data);
    return new LatenessRule(res.data);
  }

  async toggleLatenessRule(id: string, activate: boolean): Promise<LatenessRule> {
    const res = await api.post(`${this.baseUrl}/lateness-rules/${id}/toggle`, { activate });
    return new LatenessRule(res.data);
  }
}

export const latenessService = new LatenessService();
