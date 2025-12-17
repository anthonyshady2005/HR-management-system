import { api } from "@/lib/api";
import { EmployeeProfile } from "./types";

/**
 * Get team member profile (Manager View)
 * GET /employee-profile/manager/team/:id
 */
export async function getTeamMemberProfile(
  employeeId: string
): Promise<EmployeeProfile> {
  const response = await api.get(`/employee-profile/manager/team/${employeeId}`);
  return response.data;
}