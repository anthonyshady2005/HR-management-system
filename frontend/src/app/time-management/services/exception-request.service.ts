"use client";

import { api } from "@/lib/api";
import {
  TimeException,
  AttendanceCorrectionRequest,
  TimeExceptionType,
  TimeExceptionStatus,
  CorrectionRequestStatus,
} from "../models";

export class ExceptionRequestService {
  private baseUrl = "/time-management";

  // ========================
  // Time Exceptions (EXISTING)
  // ========================

  async getTimeExceptions(params?: {
    employeeId?: string;
    status?: TimeExceptionStatus;
    type?: TimeExceptionType;
    reviewerId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<TimeException[]> {
    const response = await api.get(`${this.baseUrl}/time-exceptions`, {
      params,
    });
    return response.data;
  }

  async getPendingTimeExceptions(
    reviewerId: string
  ): Promise<TimeException[]> {
    const response = await api.get(
      `${this.baseUrl}/time-exceptions/pending/${reviewerId}`
    );
    return response.data;
  }
  /**
 * US15 — Get all pending permission requests (Admin/Manager view)
 * Returns all permissions with PENDING, OPEN, or ESCALATED status
 */
async getPendingPermissions(): Promise<TimeException[]> {
  const response = await api.get(
    `${this.baseUrl}/permissions/pending`,
    {
      params: {
        status: [
          TimeExceptionStatus.PENDING,
          TimeExceptionStatus.OPEN,
          TimeExceptionStatus.ESCALATED,
        ].join(','),
      },
    }
  );
  return response.data;
}

  async createTimeException(data: {
    employeeId: string;
    attendanceRecordId: string;
    type: TimeExceptionType;
    reason?: string;
  }): Promise<TimeException> {
    const response = await api.post(`${this.baseUrl}/time-exceptions`, data);
    return response.data;
  }

  async reviewTimeException(
    exceptionId: string,
    data: {
      reviewerId: string;
      status: TimeExceptionStatus;
      comment?: string;
    }
  ): Promise<TimeException> {
    const response = await api.patch(
      `${this.baseUrl}/time-exceptions/${exceptionId}`,
      data
    );
    return response.data;
  }

  // ========================
  // Attendance Correction Requests (EXISTING)
  // ========================

  async submitCorrectionRequestByDate(data: {
    employeeId: string;
    date: string;
    reason: string;
  }): Promise<AttendanceCorrectionRequest> {
    const response = await api.post(
      `${this.baseUrl}/attendance-corrections/by-date`,
      data
    );
    return response.data;
  }

  async getCorrectionRequests(params?: {
    employeeId?: string;
    status?: CorrectionRequestStatus;
  }): Promise<AttendanceCorrectionRequest[]> {
    const response = await api.get(
      `${this.baseUrl}/attendance-corrections`,
      { params }
    );
    return response.data;
  }

  async getMyCorrectionRequests(
    employeeId: string
  ): Promise<AttendanceCorrectionRequest[]> {
    const response = await api.get(
      `${this.baseUrl}/attendance-corrections/my/${employeeId}`
    );
    return response.data;
  }

  async getPendingCorrectionRequests(): Promise<
    AttendanceCorrectionRequest[]
  > {
    const response = await api.get(
      `${this.baseUrl}/correction-requests/pending`
    );
    return response.data;
  }

  async submitCorrectionRequest(data: {
    employeeId: string;
    attendanceRecordId: string;
    reason: string;
  }): Promise<AttendanceCorrectionRequest> {
    const response = await api.post(
      `${this.baseUrl}/attendance-corrections`,
      data
    );
    return response.data;
  }

  async reviewCorrectionRequest(
    requestId: string,
    data: {
      reviewerId: string;
      status: CorrectionRequestStatus.APPROVED | CorrectionRequestStatus.REJECTED;
    }
  ): Promise<AttendanceCorrectionRequest> {
    const response = await api.patch(
      `${this.baseUrl}/attendance-corrections/${requestId}/review`,
      data
    );
    return response.data;
  }

  // ==================================================
  // USER STORY 15 — PERMISSION VALIDATION RULES (NEW)
  // ==================================================

  /**
   * US15 — Employee submits a permission request
   * employeeId is resolved from JWT on backend
   */
  async submitPermissionRequest(data: {
    attendanceRecordId: string;
    type: TimeExceptionType;
    minutesRequested: number;
    reason?: string;
  }): Promise<TimeException> {
    const response = await api.post(
      `${this.baseUrl}/permissions`,
      data
    );
    return response.data;
  }

  /**
   * US15 — Manager / HR approves or rejects permission
   * reviewer identity is resolved from JWT
   */
  async reviewPermissionRequest(
    exceptionId: string,
    data: {
      status: TimeExceptionStatus.APPROVED | TimeExceptionStatus.REJECTED;
      comment?: string;
    }
  ): Promise<TimeException> {
    const response = await api.patch(
      `${this.baseUrl}/permissions/${exceptionId}/review`,
      data
    );
    return response.data;
  }
  // ========================
// Permission Requests — by DATE (US15)
// ========================
async submitPermissionRequestByDate(data: {
  date: string; // YYYY-MM-DD
  type: TimeExceptionType;
  minutesRequested: number;
  reason?: string;
}): Promise<TimeException> {
  const response = await api.post(
    `${this.baseUrl}/permissions/by-date`,
    data
  );
  return response.data;
}
// ========================
// Permission Requests — My permissions
// ========================
async getMyPermissions(): Promise<TimeException[]> {
  const response = await api.get(
    `${this.baseUrl}/permissions/my`
  );
  return response.data;
}


  /**
   * US15 — Payroll fetches approved permissions
   */
  async getApprovedPermissions(
    employeeId: string,
    start: string,
    end: string
  ): Promise<TimeException[]> {
    const response = await api.get(
      `${this.baseUrl}/permissions/approved/${employeeId}`,
      { params: { start, end } }
    );
    return response.data;
  }
/**
 * US15 — Manual trigger for auto-escalation (Admin only)
 */
async autoEscalatePendingPermissions(): Promise<{ 
  escalated: number;
  message?: string; // ← Make message optional
}> {
  const response = await api.post(
    `${this.baseUrl}/permissions/escalate`
  );
  return response.data;
}
  /**
   * US15 — Manual trigger for auto-escalation
   */

}

export const exceptionRequestService = new ExceptionRequestService();
