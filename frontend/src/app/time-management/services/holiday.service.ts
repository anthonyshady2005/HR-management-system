"use client";

import { api } from "@/lib/api";

/* ===================== TYPES ===================== */
export enum HolidayType {
  NATIONAL = "NATIONAL",
  ORGANIZATIONAL = "ORGANIZATIONAL",
  WEEKLY_REST = "WEEKLY_REST",
}

export interface Holiday {
  _id: string;
  type: HolidayType;
  startDate: string;
  endDate?: string;
  name?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHolidayInput {
  type: HolidayType;
  startDate: string;
  endDate?: string;
  name?: string;
}

export interface UpdateHolidayInput {
  type?: HolidayType;
  startDate?: string;
  endDate?: string;
  name?: string;
}

export interface HolidayCheckResponse {
  isHoliday: boolean;
  holidays: Array<{
    id: string;
    name?: string;
    type: HolidayType;
    startDate: string;
    endDate?: string;
  }>;
}

/* ===================== SERVICE ===================== */
class HolidayService {
  private readonly baseUrl = "/time-management";

  /* =====================================================
     HOLIDAY CRUD OPERATIONS
  ===================================================== */

  /**
   * US17 — Create a new holiday
   */
  async createHoliday(data: CreateHolidayInput): Promise<Holiday> {
    const response = await api.post(`${this.baseUrl}/holidays`, data);
    return response.data;
  }

  /**
   * US17 — Get all holidays with optional filters
   */
  async getAllHolidays(params?: {
    type?: string;
    year?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<Holiday[]> {
    const response = await api.get(`${this.baseUrl}/holidays`, { params });
    return response.data;
  }

  /**
   * US17 — Get single holiday by ID
   */
  async getHolidayById(holidayId: string): Promise<Holiday> {
    const response = await api.get(`${this.baseUrl}/holidays/${holidayId}`);
    return response.data;
  }

  /**
   * US17 — Update a holiday
   */
  async updateHoliday(
    holidayId: string,
    data: UpdateHolidayInput
  ): Promise<{ success: boolean; message: string; holiday: Holiday }> {
    const response = await api.patch(
      `${this.baseUrl}/holidays/${holidayId}`,
      data
    );
    return response.data;
  }

  /**
   * US17 — Delete a holiday (soft delete)
   */
  async deleteHoliday(
    holidayId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`${this.baseUrl}/holidays/${holidayId}`);
    return response.data;
  }

  /**
   * US17 — Get upcoming holidays
   */
  async getUpcomingHolidays(days: number = 30): Promise<Holiday[]> {
    const response = await api.get(`${this.baseUrl}/holidays/upcoming`, {
      params: { days },
    });
    return response.data;
  }

  /**
   * US17 — Check if a specific date is a holiday
   */
  async checkIfHoliday(date: string): Promise<HolidayCheckResponse> {
    const response = await api.get(`${this.baseUrl}/holidays/check/${date}`);
    return response.data;
  }

  /* =====================================================
     UI HELPERS
  ===================================================== */

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Get holiday type badge styling
   */
  getHolidayTypeBadge(type: HolidayType): {
    label: string;
    bg: string;
    text: string;
  } {
    switch (type) {
      case HolidayType.NATIONAL:
        return {
          label: "National",
          bg: "bg-blue-500/20",
          text: "text-blue-400",
        };
      case HolidayType.ORGANIZATIONAL:
        return {
          label: "Organizational",
          bg: "bg-purple-500/20",
          text: "text-purple-400",
        };
      case HolidayType.WEEKLY_REST:
        return {
          label: "Weekly Rest",
          bg: "bg-green-500/20",
          text: "text-green-400",
        };
      default:
        return {
          label: "Unknown",
          bg: "bg-slate-500/20",
          text: "text-slate-400",
        };
    }
  }

  /**
   * Calculate duration in days
   */
  calculateDuration(startDate: string, endDate?: string): number {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays + 1; // Include both start and end day
  }

  /**
   * Check if holiday is active (not in the past)
   */
  isHolidayActive(startDate: string, endDate?: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const holidayEnd = endDate ? new Date(endDate) : new Date(startDate);
    holidayEnd.setHours(23, 59, 59, 999);
    
    return holidayEnd >= today;
  }

  /**
   * Get holidays for current year
   */
  async getHolidaysForCurrentYear(): Promise<Holiday[]> {
    const currentYear = new Date().getFullYear();
    return this.getAllHolidays({ year: currentYear });
  }

  /**
   * Get holidays by type
   */
  async getHolidaysByType(type: HolidayType): Promise<Holiday[]> {
    return this.getAllHolidays({ type });
  }
  /**
 * US16 — Sync holidays from Leaves calendar
 */
async syncHolidaysFromLeaves(
  year: number
): Promise<{
  success: boolean;
  message: string;
  year: number;
  totalHolidayDates: number;
  totalRecordsCreated: number;
  affectedEmployeesCount: number;
}> {
  const response = await api.post(
    `${this.baseUrl}/holidays/sync-from-leaves/${year}`
  );
  return response.data;
}

/**
 * US16 — Preview holiday sync impact
 */
async previewHolidaySync(year: number): Promise<{
  year: number;
  totalHolidayDates: number;
  totalAffectedEmployees: number;
  preview: Array<{
    date: string;
    affectedEmployees: Array<{
      employeeId: string;
      employeeName: string;
      employeeEmail: string;
      shiftName: string;
      shiftTime: string;
    }>;
  }>;
}> {
  const response = await api.get(
    `${this.baseUrl}/holidays/sync-preview/${year}`
  );
  return response.data;
}

}

/* ===================== EXPORT ===================== */
export const holidayService = new HolidayService();