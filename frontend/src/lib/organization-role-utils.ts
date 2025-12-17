/**
 * Organization Structure Module - Role-Based Permission Utilities
 * 
 * This file contains permission checks specific to the Organization Structure Module.
 * Keep this separate from the global role-utils.ts
 */

/**
 * Check if a role can create departments
 * @param role - The user's current role
 * @returns true if the role can create departments
 */
export function canCreateDepartment(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  return (
    normalizedRole === 'system admin' ||
    normalizedRole === 'hr manager' ||
    normalizedRole === 'hr admin'
  );
}

/**
 * Check if a role can update any department (not just their own)
 * @param role - The user's current role
 * @returns true if the role can update any department
 */
export function canUpdateDepartment(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  return (
    normalizedRole === 'system admin' ||
    normalizedRole === 'hr manager' ||
    normalizedRole === 'hr admin'
  );
}

/**
 * Check if a role can update their own department only
 * @param role - The user's current role
 * @returns true if the role can update their own department (Department Head)
 */
export function canUpdateOwnDepartment(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  return normalizedRole === 'department head';
}

/**
 * Check if a role can update a specific department
 * @param role - The user's current role
 * @param departmentId - The ID of the department to update
 * @param userDepartmentId - The ID of the user's department (if applicable)
 * @returns true if the role can update the specified department
 */
export function canUpdateSpecificDepartment(
  role: string | null | undefined,
  departmentId: string,
  userDepartmentId?: string | null
): boolean {
  if (!role) return false;
  
  // System Admin, HR Manager, HR Admin can update any department
  if (canUpdateDepartment(role)) {
    return true;
  }
  
  // Department Head can only update their own department
  if (canUpdateOwnDepartment(role) && userDepartmentId) {
    return departmentId === userDepartmentId;
  }
  
  return false;
}

/**
 * Check if a role can deactivate departments
 * @param role - The user's current role
 * @returns true if the role can deactivate departments
 */
export function canDeactivateDepartment(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  return (
    normalizedRole === 'system admin' ||
    normalizedRole === 'hr manager'
  );
  // Note: HR Admin cannot deactivate (only System Admin and HR Manager)
}

/**
 * Check if a role can view all departments (full company view)
 * @param role - The user's current role
 * @returns true if the role can view all departments
 */
export function canViewAllDepartments(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  return (
    normalizedRole === 'system admin' ||
    normalizedRole === 'hr manager' ||
    normalizedRole === 'hr admin'
  );
}

/**
 * Check if a role can only view their own department
 * @param role - The user's current role
 * @returns true if the role has limited department view (only own department)
 */
export function canViewOwnDepartmentOnly(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  return (
    normalizedRole === 'department head' ||
    normalizedRole === 'department employee' ||
    normalizedRole === 'hr employee'
  );
}

/**
 * Check if a role can create positions
 * @param role - The user's current role
 * @returns true if the role can create positions
 */
export function canCreatePosition(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  return (
    normalizedRole === 'system admin' ||
    normalizedRole === 'hr manager' ||
    normalizedRole === 'hr admin'
  );
}

/**
 * Check if a role can update positions
 * @param role - The user's current role
 * @returns true if the role can update positions
 */
export function canUpdatePosition(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  return (
    normalizedRole === 'system admin' ||
    normalizedRole === 'hr manager' ||
    normalizedRole === 'hr admin'
  );
}

/**
 * Check if a role can deactivate positions
 * @param role - The user's current role
 * @returns true if the role can deactivate positions
 */
export function canDeactivatePosition(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  return (
    normalizedRole === 'system admin' ||
    normalizedRole === 'hr manager'
  );
}

/**
 * Check if a role can approve change requests
 * @param role - The user's current role
 * @returns true if the role can approve change requests
 */
export function canApproveChangeRequests(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  return (
    normalizedRole === 'system admin' ||
    normalizedRole === 'hr manager'
  );
}

/**
 * Check if a role can submit change requests
 * @param role - The user's current role
 * @returns true if the role can submit change requests
 */
export function canSubmitChangeRequests(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  return (
    normalizedRole === 'department head' ||
    normalizedRole === 'department employee' ||
    normalizedRole === 'hr manager' ||
    normalizedRole === 'system admin'
  );
}

/**
 * Check if a role can access the Organization Structure page
 * @param role - The user's current role
 * @returns true if the role can access the page (all employees)
 */
export function canAccessOrganizationStructurePage(role: string | null | undefined): boolean {
  // All employees can access the organization structure page
  return !!role;
}

/**
 * Check if a role can view the Org Chart tab
 * @param role - The user's current role
 * @returns true if the role can view the org chart (all employees)
 */
export function canViewOrgChart(role: string | null | undefined): boolean {
  // All employees can view the org chart
  return !!role;
}

/**
 * Check if a role can view the Change Requests tab
 * @param role - The user's current role
 * @returns true if the role can view change requests (all employees)
 */
export function canViewChangeRequestsTab(role: string | null | undefined): boolean {
  // All employees can view the change requests tab
  return !!role;
}

/**
 * Check if a role is System Admin
 * @param role - The user's current role
 * @returns true if the role is System Admin
 */
export function isSystemAdmin(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  return normalizedRole === 'system admin';
}
