// frontend/src/app/time-management/services/reports.service.ts
"use client";

import { api } from "@/lib/api";

export type DateRangeParams = {
  start?: string;      // e.g. "2025-12-01" (optional)
  end?: string;        // e.g. "2025-12-31" (optional)
  employeeId?: string;
};

type CsvEnvelope = {
  fileName?: string;
  mimeType?: string;
  content: string; // actual CSV text from backend
};

/**
 * Small helper to clean params: remove undefined / empty string
 */
function buildQueryParams(params: DateRangeParams) {
  const qp: Record<string, string> = {};

  if (params.start && params.start.trim() !== "") {
    qp.start = params.start;
  }
  if (params.end && params.end.trim() !== "") {
    qp.end = params.end;
  }
  if (params.employeeId && params.employeeId.trim() !== "") {
    qp.employeeId = params.employeeId;
  }

  return qp;
}

/**
 * Helper to request CSV and convert the JSON envelope into a Blob
 */
async function requestCsv(url: string, params: DateRangeParams): Promise<Blob> {
  const queryParams = buildQueryParams(params);

  const response = await api.get<CsvEnvelope | Blob>(url, {
    params: {
      ...queryParams,
      exportCsv: true,
    },
  });

  const data = response.data as any;

  // If backend ever returns Blob directly, just pass it through
  if (typeof Blob !== "undefined" && data instanceof Blob) {
    return data;
  }

  if (!data || typeof data !== "object" || typeof data.content !== "string") {
    throw new Error("Invalid CSV response format from server.");
  }

  // Add BOM so Excel opens UTF-8 CSV correctly
  const csvText = "\uFEFF" + data.content;

  return new Blob([csvText], {
    type: data.mimeType || "text/csv;charset=utf-8;",
  });
}

/**
 * TIME MANAGEMENT REPORTS SERVICE
 * User Story 19 — Overtime & Exception Reports
 */
export const timeManagementReportsService = {
  /**
   * Get Overtime Report as JSON
   * Maps to: GET /time-management/reports/overtime
   */
  async getOvertimeReport(params: DateRangeParams) {
    const queryParams = buildQueryParams(params);

    const response = await api.get("/time-management/reports/overtime", {
      params: queryParams,
    });

    return response.data;
  },

  /**
   * Download Overtime Report as CSV (Blob)
   * Uses exportCsv=true and unwraps JSON envelope
   */
  async downloadOvertimeReportCsv(params: DateRangeParams) {
    return requestCsv("/time-management/reports/overtime", params);
  },

  /**
   * Get Exception Report as JSON
   * Maps to: GET /time-management/reports/exceptions
   */
  async getExceptionReport(params: DateRangeParams) {
    const queryParams = buildQueryParams(params);

    const response = await api.get("/time-management/reports/exceptions", {
      params: queryParams,
    });

    return response.data;
  },

  /**
   * Download Exception Report as CSV (Blob)
   * Uses exportCsv=true and unwraps JSON envelope
   */
  async downloadExceptionReportCsv(params: DateRangeParams) {
    return requestCsv("/time-management/reports/exceptions", params);
  },
};
