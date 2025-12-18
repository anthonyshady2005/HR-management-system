/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * API client functions for Employee Profile Module
 * All endpoints use the centralized axios instance from @/lib/api
 */

import { api } from "@/lib/api";
import type {
  EmployeeProfile,
  UpdateSelfProfileDto,
  SubmitChangeRequestDto,
  EmployeeProfileChangeRequest,
  TeamMember,
  TeamSummary,
  SearchEmployeesParams,
  PaginatedResponse,
  UpdateEmployeeProfileDto,
  ProcessChangeRequestDto,
  DeactivateEmployeeDto,
  AssignRolesDto,
  EmployeeSystemRole,
  ProfileAuditLog,
  CreateEmployeeProfileDto,
  Department,
  Position,
} from "./types";

// ==================== EMPLOYEE SELF-SERVICE ====================

/**
 * Get current user's own profile
 * GET /employee-profile/me
 */
export async function getMyProfile(): Promise<EmployeeProfile> {
  const response = await api.get("/employee-profile/me");
  return response.data;
}

/**
 * Update own profile (self-editable fields only)
 * PATCH /employee-profile/me
 */
export async function updateMyProfile(
  data: UpdateSelfProfileDto
): Promise<EmployeeProfile> {
  const response = await api.patch("/employee-profile/me", data);
  return response.data;
}

/**
 * Submit change request for governed fields
 * POST /employee-profile/me/change-requests
 */
export async function submitChangeRequest(
  data: SubmitChangeRequestDto
): Promise<EmployeeProfileChangeRequest> {
  const response = await api.post("/employee-profile/me/change-requests", data);
  return response.data;
}

/**
 * Get current user's change requests
 * GET /employee-profile/me/change-requests
 */
export async function getMyChangeRequests(
  page = 1,
  limit = 20
): Promise<PaginatedResponse<EmployeeProfileChangeRequest>> {
  const response = await api.get("/employee-profile/me/change-requests", {
    params: { page, limit },
  });
  return response.data;
}

// ==================== DEPARTMENT MANAGER ====================

/**
 * Get direct reports (team members)
 * GET /employee-profile/manager/team
 */
export async function getMyTeam(): Promise<TeamMember[]> {
  const response = await api.get("/employee-profile/manager/team");
  return response.data.teamMembers || [];
}

/**
 * Get team summary statistics
 * GET /employee-profile/manager/team/summary
 */
export async function getTeamSummary(): Promise<TeamSummary> {
  const response = await api.get("/employee-profile/manager/team/summary");
  return response.data;
}

/**
 * Get a specific team member's profile (privacy-filtered)
 * GET /employee-profile/manager/team/:id
 */
export async function getTeamMemberProfile(
  employeeId: string
): Promise<TeamMember> {
  const response = await api.get(`/employee-profile/manager/team/${employeeId}`);
  return response.data;
}

// ==================== HR ADMIN / SYSTEM ADMIN ====================

/**
 * Search employees with filters and pagination
 * GET /employee-profile/search
 */
export async function searchEmployees(
  params: SearchEmployeesParams
): Promise<PaginatedResponse<EmployeeProfile>> {
  const response = await api.get("/employee-profile/search", { params });
  return response.data;
}

/**
 * Get full employee profile by ID
 * GET /employee-profile/:id
 */
export async function getEmployeeById(
  employeeId: string
): Promise<EmployeeProfile> {
  const response = await api.get(`/employee-profile/${employeeId}`);
  return response.data;
}

/**
 * Update employee profile (HR Admin only)
 * PATCH /employee-profile/:id
 */
export async function updateEmployeeById(
  employeeId: string,
  data: UpdateEmployeeProfileDto
): Promise<EmployeeProfile> {
  const response = await api.patch(`/employee-profile/${employeeId}`, data);
  return response.data;
}

/**
 * Get all change requests with optional status filter
 * GET /employee-profile/change-requests?status=PENDING|APPROVED|REJECTED|ALL
 */
export async function getAllChangeRequests(
  page = 1,
  limit = 20,
  status?: string
): Promise<PaginatedResponse<EmployeeProfileChangeRequest>> {
  const response = await api.get("/employee-profile/change-requests", {
    params: { page, limit, ...(status && { status }) },
  });
  return response.data;
}

/**
 * Get all pending change requests
 * GET /employee-profile/change-requests/pending
 * @deprecated Use getAllChangeRequests with status='PENDING' instead
 */
export async function getPendingChangeRequests(
  page = 1,
  limit = 20
): Promise<PaginatedResponse<EmployeeProfileChangeRequest>> {
  return getAllChangeRequests(page, limit, "PENDING");
}

/**
 * Process change request (approve or reject)
 * PATCH /employee-profile/change-requests/:id/process
 */
export async function processChangeRequest(
  requestId: string,
  data: ProcessChangeRequestDto
): Promise<EmployeeProfileChangeRequest> {
  const response = await api.patch(
    `/employee-profile/change-requests/${requestId}/process`,
    data
  );
  return response.data;
}

/**
 * Delete change request
 * DELETE /employee-profile/change-requests/:id
 */
export async function deleteChangeRequest(
  requestId: string
): Promise<{ message: string }> {
  const response = await api.delete(
    `/employee-profile/change-requests/${requestId}`
  );
  return response.data;
}

/**
 * Create a new employee profile
 * POST /employee-profile
 */
export async function createEmployee(
  data: CreateEmployeeProfileDto
): Promise<{ message: string; employee: EmployeeProfile }> {
  const response = await api.post("/employee-profile", data);
  return response.data;
}

/**
 * Manager assigns an employee to their team
 * POST /employee-profile/manager/team/add
 */
export async function addEmployeeToTeam(
  employeeId: string
): Promise<{ message: string; employee: EmployeeProfile }> {
  const response = await api.post("/employee-profile/manager/team/add", {
    employeeId,
  });
  return response.data;
}

/**
 * Deactivate employee
 * POST /employee-profile/:id/deactivate
 */
export async function deactivateEmployee(
  employeeId: string,
  data: DeactivateEmployeeDto
): Promise<EmployeeProfile> {
  const response = await api.post(
    `/employee-profile/${employeeId}/deactivate`,
    data
  );
  return response.data;
}

/**
 * Assign roles and permissions to employee
 * POST /employee-profile/:id/roles
 */
export async function assignRoles(
  employeeId: string,
  data: AssignRolesDto
): Promise<EmployeeSystemRole> {
  const response = await api.post(`/employee-profile/${employeeId}/roles`, data);
  return response.data;
}

/**
 * Get employee's assigned roles
 * GET /employee-profile/:id/roles
 */
export async function getEmployeeRoles(
  employeeId: string
): Promise<EmployeeSystemRole> {
  const response = await api.get(`/employee-profile/${employeeId}/roles`);
  return response.data;
}

/**
 * Get audit history for employee
 * GET /employee-profile/:id/audit-history
 */
export async function getAuditHistory(
  employeeId: string,
  page = 1,
  limit = 50
): Promise<PaginatedResponse<ProfileAuditLog>> {
  const response = await api.get(
    `/employee-profile/${employeeId}/audit-history`,
    {
      params: { page, limit },
    }
  );
  return response.data;
}

/**
 * Get all active departments
 * GET /organization-structure/departments
 */
export async function getDepartments(): Promise<Department[]> {
  const response = await api.get("/organization-structure/departments");
  return response.data;
}

/**
 * Get all active positions
 * GET /organization-structure/positions/list
 */
export async function getPositions(): Promise<Position[]> {
  const response = await api.get("/organization-structure/positions/list");
  return response.data;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if a field is self-editable
 */
export function isSelfEditableField(fieldName: string): boolean {
  const selfEditableFields = [
    "mobilePhone",
    "personalEmail",
    "address",
    "biography",
    "profilePictureUrl",
  ];
  return selfEditableFields.includes(fieldName);
}

/**
 * Check if a field is governed (requires change request)
 */
export function isGovernedField(fieldName: string): boolean {
  const governedFields = [
    "firstName",
    "lastName",
    "nationalId",
    "dateOfBirth",
    "gender",
    "maritalStatus",
    "positionId",
    "departmentId",
    "payGradeId",
  ];
  return governedFields.includes(fieldName);
}

/**
 * Format field name for display
 */
export function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace("Id", "");
}

/**
 * Get populated value or ID
 */
export function getPopulatedValue(
  value: any,
  displayField: string = "name"
): string {
  if (!value) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value[displayField] || value.title || value._id || "—";
  }
  return String(value);
}

