"use client";

import { api } from "@/lib/api";
import { TimeException } from "../models";

/* ===================== TYPES ===================== */
export interface RebuildNotificationsResponse {
  created: number;
}

export type PunchType = "IN" | "OUT";

export interface ManualAttendanceCorrectionInput {
  employee: string; // email | personalEmail | employeeNumber
  date: string;     // YYYY-MM-DD
  newPunches: {
    type: PunchType;
    time: string;   // HH:mm
  }[];
  reason: string;
  managerId?: string; // optional if no JWT
}

export interface ExcelRowData {
  rowNumber: number;
  employeeIdentifier: string;
  date: string;
  time: string;
  type: PunchType;
  isValid: boolean;
  errors: string[];
}

export interface ExcelUploadResponse {
  success: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  data: ExcelRowData[];
}

export interface ProcessExcelResponse {
  totalProcessed: number;
  successful: number;
  failed: number;
  successRate: string;
  details: {
    successful: Array<{
      row: ExcelRowData;
      result: any;
      rowNumber: number;
    }>;
    failed: Array<{
      row: ExcelRowData;
      error: string;
      rowNumber: number;
    }>;
  };
}

export interface Punch {
  type: PunchType;
  time: string;
  _id?: string;
}

export interface AttendanceRecord {
  _id: string;
  attendanceId: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    personalEmail: string;
  };
  date: string;
  punches: Punch[];
  totalWorkMinutes: number;
  hasMissedPunch: boolean;
  status: string;
  finalisedForPayroll: boolean;
}

export interface AttendanceStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  averageHours: number;
}

/* ===================== SERVICE ===================== */

class AttendanceOverviewService {
  private readonly baseUrl = "/time-management/attendance";

  /* =====================================================
     EXCEL IMPORT
  ===================================================== */

  async uploadExcelFile(file: File): Promise<ExcelUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post(`${this.baseUrl}/upload-excel`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  }

  async processExcelData(rows: ExcelRowData[]): Promise<ProcessExcelResponse> {
    const validRows = rows.filter((r) => r.isValid);

    if (validRows.length === 0) {
      throw new Error("No valid rows to process");
    }

    const res = await api.post(`${this.baseUrl}/process-excel-data`, {
      rows: validRows,
    });

    return res.data;
  }

  async uploadAndProcessExcel(
    file: File,
    autoProcess = false
  ): Promise<{
    upload: ExcelUploadResponse;
    process?: ProcessExcelResponse;
  }> {
    const upload = await this.uploadExcelFile(file);

    if (autoProcess && upload.invalidRows === 0) {
      const process = await this.processExcelData(upload.data);
      return { upload, process };
    }

    return { upload };
  }

  /* =====================================================
     CLOCK IN / OUT
  ===================================================== */

  async clockIn(employeeIdentifier: string): Promise<AttendanceRecord> {
    const res = await api.post(`${this.baseUrl}/clock-in`, {
      employeeIdentifier,
    });
    return res.data;
  }

  async clockOut(employeeIdentifier: string): Promise<AttendanceRecord> {
    const res = await api.post(`${this.baseUrl}/clock-out`, {
      employeeIdentifier,
    });
    return res.data;
  }

  async logExternalPunch(input: {
    employeeIdentifier: string;
    date: string;
    time: string;
    type: PunchType;
  }): Promise<AttendanceRecord> {
    const res = await api.post(`${this.baseUrl}/external-punch`, input);
    return res.data;
  }

  /* =====================================================
     ATTENDANCE RECORDS
  ===================================================== */

  async getAttendanceRecords(params?: {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
    page?: number;
    limit?: number;
  }): Promise<AttendanceRecord[]> {
    const res = await api.get(this.baseUrl, { params });
    return res.data;
  }

async getAttendanceRecordsFinalized(params?: {
  page?: number;
  limit?: number;
}): Promise<any> {
  const res = await api.get(`time-management/attendance/finalized`, { params });
  return res.data;
}
  async getAttendanceRecordById(id: string): Promise<AttendanceRecord> {
    const res = await api.get(`${this.baseUrl}/${id}`);
    return res.data;
  }

  /**
 * US9 — Finalize single attendance record by ID
 */


async finalizeSingleRecord(recordId: string) {
  const res = await api.post(`${this.baseUrl}/${recordId}/finalize`);
  return res.data;
}

async finalizeAllCompleteRecords(filters: {
  startDate?: string;
  endDate?: string;
}) {
  const res = await api.post(
    `${this.baseUrl}/finalize-all-complete`,
    null,
    { params: filters }
  );
  return res.data;
}


async getPendingPermissions(): Promise<TimeException[]> {
  const response = await api.get(
    `${this.baseUrl}/permissions/pending`, // ❌ DOES NOT EXIST
    { params: {} }
  );
  return response.data;
}

  async getAttendanceStats(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<AttendanceStats> {
    const res = await api.get(`${this.baseUrl}/stats`, { params });
    return res.data;
  }

  /* =====================================================
     MANUAL ATTENDANCE CORRECTION (IMPORTANT)
  ===================================================== */

  /**
   * Sends corrected punches + reason to backend.
   * Must match: POST /time-management/attendance/manual-corrections
   */
  async correctAttendanceManually(
  input: ManualAttendanceCorrectionInput
): Promise<any> {
  const response = await api.post(
    `${this.baseUrl}/manual-corrections`,
    input
  );

  return response.data;
}
  /* =====================================================
     HR LATENESS NOTIFICATIONS (REFRESH-BASED)
  ===================================================== */

  /**
   * Rebuilds DAILY lateness notifications
   * - Deletes old notifications for current HR user
   * - Recreates notifications for all late attendances
   *
   * Backend:
   * POST /time-management/lateness/notifications/rebuild
   */
  async rebuildLatenessNotifications(
  days: number = 30
): Promise<{ created: number }> {
  const res = await api.post(
    `/time-management/lateness/notifications/rebuild`,
    null,
    { params: { days } }
  );
  return res.data;
}


  /**
   * Rebuilds REPEATED lateness notifications
   * - Deletes old repeated-lateness notifications
   * - Creates ONE notification per employee
   *   if lateness >= threshold (3) in last X days
   *
   * Backend:
   * POST /time-management/lateness/repeated/notifications/rebuild
   */
  async rebuildRepeatedLatenessNotifications(
    days: number = 30
  ): Promise<RebuildNotificationsResponse> {
    const res = await api.post(
      `/time-management/lateness/repeated/notifications/rebuild`,
      null,
      {
        params: { days },
      }
    );

    return res.data;
  }

/**
 * US9 — Finalize complete attendance records for payroll
 */
/**
 * US9 — Finalize complete attendance records for payroll
 */
async finalizeAttendanceForPayroll(filters?: {
  startDate?: string;
  endDate?: string;
}): Promise<{ success: boolean; finalized: number; message: string }> {
  const response = await api.post(`${this.baseUrl}/finalize-for-payroll`, null, {
    params: filters,
  });
  return response.data;
}

/**
 * US9 — Get unfinalized attendance records
 */
/**
 * US9 — Get unfinalized attendance records
 */
async getUnfinalizedAttendance(params?: {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<{
  data: any[];
  page: number;
  limit: number;
  totalPages: number;
  totalRecords: number;
}> {
  const response = await api.get(`${this.baseUrl}/unfinalized`, { // ← Changed from api.get` to api.get(
    params,
  });
  return response.data;
}
  /* =====================================================
     UI HELPERS
  ===================================================== */

  formatPunchTime(time: string): string {
    return new Date(time).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  calculateWorkHours(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  }

  getStatusBadge(hasMissedPunch: boolean) {
    return hasMissedPunch
      ? {
          label: "Incomplete",
          bg: "bg-amber-500/20",
          text: "text-amber-400",
        }
      : {
          label: "Complete",
          bg: "bg-green-500/20",
          text: "text-green-400",
        };
  }

  downloadSampleTemplate() {
    const rows = [
      {
        "Employee Email": "john.doe@example.com",
        Date: "2025-12-14",
        Time: "09:00",
        Type: "IN",
      },
      {
        "Employee Email": "john.doe@example.com",
        Date: "2025-12-14",
        Time: "17:30",
        Type: "OUT",
      },
    ];

    const csv = [
      Object.keys(rows[0]).join(","),
      ...rows.map((r) => Object.values(r).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance_template.csv";
    a.click();

    URL.revokeObjectURL(url);
  }
}

/* ===================== EXPORT ===================== */

export const attendanceOverviewService =
  new AttendanceOverviewService();
