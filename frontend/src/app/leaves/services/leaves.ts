"use client";

import { api } from "@/lib/api";

// --- Types aligned with backend DTOs (only fields needed by the UI) ---

export type LeaveCategory = {
  id: string;
  name: string;
  description?: string;
};

export type LeaveType = {
  id: string;
  code: string;
  name: string;
  description?: string;
  paid?: boolean;
  deductible?: boolean;
  requiresAttachment?: boolean;
  attachmentType?: string;
  minTenureMonths?: number;
  maxDurationDays?: number;
  category?: LeaveCategory;
};

export type LeavePolicy = {
  id: string;
  leaveType: LeaveType;
  accrualMethod?: string;
  monthlyRate?: number;
  yearlyRate?: number;
  carryForwardAllowed?: boolean;
  maxCarryForward?: number;
  expiryAfterMonths?: number;
  roundingRule?: string;
  minNoticeDays?: number;
  maxConsecutiveDays?: number;
  eligibility?: Record<string, any>;
};

export type LeaveEntitlement = {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  yearlyEntitlement: number;
  accruedActual: number;
  accruedRounded: number;
  carryForward: number;
  taken: number;
  pending: number;
  remaining: number;
  lastAccrualDate?: string;
  nextResetDate?: string;
};

export type CalendarResponse = {
  year: number;
  holidays: Array<string | Holiday>;
  blockedPeriods: { from: string; to: string; reason: string }[];
};

export type Holiday = {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate?: string;
};

export const HOLIDAY_TYPES = ['NATIONAL', 'ORGANIZATIONAL', 'WEEKLY_REST'] as const;

export type LeaveRequest = {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  dates: { from: string; to: string };
  durationDays: number;
  justification?: string;
  attachmentId?: string;
  approvalFlow?: { role: string; status: string; decidedBy?: string; decidedAt?: string }[];
  status: "pending" | "approved" | "rejected" | "cancelled";
  irregularPatternFlag?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NetDaysResponse = {
  totalDays: number;
  weekendsExcluded: number;
  holidaysExcluded: number;
  netDays: number;
  holidayDates: string[];
};

export type LeaveRequestFilters = {
  employeeId?: string;
  leaveTypeId?: string;
  status?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "dates.from" | "createdAt";
  sortOrder?: "asc" | "desc";
};

export type AdjustmentPayload = {
  employeeId: string;
  leaveTypeId: string;
  adjustmentType: "add" | "deduct" | "encashment";
  amount: number;
  reason: string;
  hrUserId: string;
};

// --- API wrappers ---

export async function fetchLeaveTypes(): Promise<LeaveType[]> {
  const res = await api.get("/leaves/types");
  return res.data;
}

export async function fetchLeaveCategories(): Promise<LeaveCategory[]> {
  const res = await api.get("/leaves/categories");
  return res.data;
}

export async function createLeaveCategory(payload: { name: string; description?: string }) {
  const res = await api.post("/leaves/categories", payload);
  return res.data as LeaveCategory;
}

export async function updateLeaveCategory(id: string, payload: { name?: string; description?: string }) {
  const res = await api.patch(`/leaves/categories/${id}`, payload);
  return res.data as LeaveCategory;
}

export async function deleteLeaveCategory(id: string) {
  await api.delete(`/leaves/categories/${id}`);
}

export async function createLeaveType(payload: {
  code: string;
  name: string;
  categoryId: string;
  description?: string;
  paid?: boolean;
  deductible?: boolean;
  requiresAttachment?: boolean;
}) {
  const res = await api.post("/leaves/types", payload);
  return res.data as LeaveType;
}

export async function updateLeaveType(
  id: string,
  payload: {
    code?: string;
    name?: string;
    categoryId?: string;
    description?: string;
    paid?: boolean;
    deductible?: boolean;
    requiresAttachment?: boolean;
  },
) {
  const res = await api.patch(`/leaves/types/${id}`, payload);
  return res.data as LeaveType;
}

export async function deleteLeaveType(id: string) {
  await api.delete(`/leaves/types/${id}`);
}

export async function fetchPolicyByLeaveType(leaveTypeId: string): Promise<LeavePolicy | null> {
  if (!leaveTypeId) return null;
  const res = await api.get(`/leaves/policies/leave-type/${leaveTypeId}`);
  return res.data || null;
}

export async function fetchPolicies(): Promise<LeavePolicy[]> {
  const res = await api.get("/leaves/policies");
  return res.data as LeavePolicy[];
}

export async function createLeavePolicy(payload: {
  leaveTypeId: string;
  accrualMethod?: string;
  monthlyRate?: number;
  yearlyRate?: number;
  carryForwardAllowed?: boolean;
  maxCarryForward?: number;
  expiryAfterMonths?: number;
  roundingRule?: string;
  minNoticeDays?: number;
  maxConsecutiveDays?: number;
  eligibility?: Record<string, any>;
}) {
  const res = await api.post("/leaves/policies", payload);
  return res.data as LeavePolicy;
}

export async function updateLeavePolicy(
  id: string,
  payload: {
    accrualMethod?: string;
    monthlyRate?: number;
    yearlyRate?: number;
    carryForwardAllowed?: boolean;
    maxCarryForward?: number;
    expiryAfterMonths?: number;
    roundingRule?: string;
    minNoticeDays?: number;
    maxConsecutiveDays?: number;
    eligibility?: Record<string, any>;
  },
) {
  const res = await api.patch(`/leaves/policies/${id}`, payload);
  return res.data as LeavePolicy;
}

export async function deleteLeavePolicy(id: string) {
  await api.delete(`/leaves/policies/${id}`);
}

export async function fetchEntitlementsByEmployee(employeeId: string): Promise<LeaveEntitlement[]> {
  const res = await api.get(`/leaves/entitlements/employee/${employeeId}`);
  return res.data;
}

export async function fetchEntitlementById(id: string): Promise<LeaveEntitlement> {
  const res = await api.get(`/leaves/entitlements/${id}`);
  return res.data as LeaveEntitlement;
}

export async function createEntitlement(payload: {
  employeeId: string;
  leaveTypeId: string;
  yearlyEntitlement?: number;
  accruedActual?: number;
  accruedRounded?: number;
  carryForward?: number;
}) {
  const res = await api.post("/leaves/entitlements", payload);
  return res.data as LeaveEntitlement;
}

export async function createPersonalizedEntitlement(payload: {
  employeeId: string;
  leaveTypeId: string;
  yearlyEntitlement?: number;
  accruedActual?: number;
  accruedRounded?: number;
  carryForward?: number;
}) {
  const res = await api.post("/leaves/entitlements/personalized", payload);
  return res.data as LeaveEntitlement;
}

export async function updateEntitlementBalance(
  id: string,
  payload: Partial<{
    yearlyEntitlement: number;
    accruedActual: number;
    accruedRounded: number;
    carryForward: number;
    taken: number;
    pending: number;
  }>,
) {
  const res = await api.patch(`/leaves/entitlements/${id}/balance`, payload);
  return res.data as LeaveEntitlement;
}

export async function fetchBalanceSummary(params: { employeeId: string; leaveTypeId: string }) {
  const res = await api.get("/leaves/balances/summary", { params });
  return res.data;
}

export async function fetchEmployeeRequests(params: Omit<LeaveRequestFilters, "employeeId"> = {}) {
  const res = await api.get("/leaves/requests/me", { params });
  return res.data as LeaveRequest[];
}

export async function fetchAllRequests(params: LeaveRequestFilters = {}) {
  const res = await api.get("/leaves/requests", { params });
  return res.data as LeaveRequest[];
}

export async function updateRequestStatus(
  requestId: string,
  status: "approved" | "rejected" | "pending" | "cancelled",
  decidedBy?: string,
) {
  await api.patch(`/leaves/requests/${requestId}/status`, {
    status,
    decidedBy,
    role: "HR Admin",
  });
}

export async function overrideRequest(
  requestId: string,
  decision: "approve" | "reject",
  justification: string,
) {
  await api.patch(`/leaves/requests/${requestId}/override`, {
    decision,
    justification,
  });
}

export async function flagIrregularRequest(requestId: string) {
  await api.patch(`/leaves/requests/${requestId}/flag-irregular`);
}

export async function fetchRequestById(id: string) {
  const res = await api.get(`/leaves/requests/${id}`);
  return res.data as LeaveRequest;
}

export async function fetchMyRequestById(id: string) {
  const res = await api.get(`/leaves/requests/me/${id}`);
  return res.data as LeaveRequest;
}

export async function fetchMyProfile() {
  const res = await api.get("/employee-profile/me");
  return res.data;
}

export type NotificationLog = {
  _id: string;
  to: any;
  type: string;
  message?: string;
  createdAt?: string;
};

export async function fetchNotifications(params?: { to?: string }) {
  const res = await api.get("/leaves/notifications", { params });
  return res.data as NotificationLog[];
}


export async function submitLeaveRequest(payload: {
  employeeId: string;
  leaveTypeId: string;
  from: string;
  to: string;
  durationDays: number;
  justification?: string;
  attachmentId?: string;
}) {
  const res = await api.post("/leaves/requests", {
    employeeId: payload.employeeId,
    leaveTypeId: payload.leaveTypeId,
    dates: { from: payload.from, to: payload.to },
    durationDays: payload.durationDays,
    justification: payload.justification || undefined,
    attachmentId: payload.attachmentId || undefined,
  });
  return res.data as LeaveRequest;
}

export async function cancelLeaveRequest(requestId: string) {
  await api.delete(`/leaves/requests/${requestId}/cancel`);
}

export async function createAdjustment(payload: AdjustmentPayload) {
  await api.post("/leaves/adjustments", payload);
}

export async function updateLeaveRequest(requestId: string, updates: Partial<{ from: string; to: string; durationDays: number; justification: string; attachmentId: string }>) {
  const res = await api.patch(`/leaves/requests/${requestId}`, {
    fromDate: updates.from,
    toDate: updates.to,
    durationDays: updates.durationDays,
    justification: updates.justification,
    attachmentId: updates.attachmentId,
  });
  return res.data as LeaveRequest;
}

export async function calculateNetDays(employeeId: string, from: string, to: string) {
  const res = await api.post<NetDaysResponse>("/leaves/calculations/net-days", {
    employeeId,
    from,
    to,
  });
  return res.data;
}

export async function checkIfDateBlocked(date: string) {
  const res = await api.get("/leaves/calendars/check-blocked", { params: { date } });
  return res.data as { date: string; isBlocked: boolean };
}

export async function runAccrual(period: "monthly" | "quarterly" | "yearly") {
  await api.post(`/leaves/accrual/run-${period}`);
}

export async function runEmployeeAccrual(employeeId: string) {
  await api.post(`/leaves/accrual/employee/${employeeId}`);
}

export async function runCarryForward() {
  await api.post("/leaves/carry-forward/run");
}

export async function calculateResetDates() {
  await api.post("/leaves/reset-dates/calculate");
}

export async function validateBalance(employeeId: string, leaveTypeId: string, days: number) {
  await api.get("/leaves/validation/check-balance", { params: { employeeId, leaveTypeId, days } });
}

export async function validateOverlap(employeeId: string, from: string, to: string, excludeRequestId?: string) {
  await api.get("/leaves/validation/check-overlap", { params: { employeeId, from, to, excludeRequestId } });
}

export async function validateDocuments(leaveTypeId: string, days: number, hasAttachment: boolean) {
  await api.get("/leaves/validation/check-documents", {
    params: { leaveTypeId, days, hasAttachment },
  });
}

// Calendars / Blocked Periods / Holidays
export async function createCalendar(payload: { year: number }) {
  const res = await api.post("/leaves/calendars", payload);
  return res.data as CalendarResponse;
}

export async function fetchCalendar(year: number) {
  const res = await api.get(`/leaves/calendars/${year}`);
  return res.data as CalendarResponse;
}

export async function addBlockedPeriod(year: number, payload: { from: string; to: string; reason: string }) {
  const res = await api.post(`/leaves/calendars/${year}/blocked-periods`, payload);
  return res.data as CalendarResponse;
}

export async function removeBlockedPeriod(year: number, index: number) {
  const res = await api.delete(`/leaves/calendars/${year}/blocked-periods/${index}`);
  return res.data as CalendarResponse;
}

export async function addHolidayToCalendar(year: number, holidayId: string) {
  const res = await api.post(`/leaves/calendars/${year}/holidays`, { holidayId });
  return res.data as CalendarResponse;
}

export async function removeHolidayFromCalendar(year: number, holidayId: string) {
  const res = await api.delete(`/leaves/calendars/${year}/holidays/${holidayId}`);
  return res.data as CalendarResponse;
}

// Holidays (time-management)
export async function createHoliday(payload: { name: string; type: string; startDate: string; endDate?: string }) {
  const res = await api.post("/leaves/holidays", payload);
  return res.data as Holiday;
}

export async function fetchHolidays(): Promise<Holiday[]> {
  const res = await api.get("/leaves/holidays");
  return res.data as Holiday[];
}

export async function fetchHolidayById(id: string): Promise<Holiday> {
  const res = await api.get(`/leaves/holidays/${id}`);
  return res.data as Holiday;
}

export async function uploadAttachments(files: File[]): Promise<Array<{id: string, name: string}>> {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  const response = await api.post("/leaves/attachments/upload", formData);
  return response.data.attachments;
}

export function getAttachmentDownloadUrl(attachmentId: string): string {
  const baseURL = api.defaults.baseURL || "http://localhost:3000";
  return `${baseURL}/leaves/attachments/${attachmentId}/download`;
}
