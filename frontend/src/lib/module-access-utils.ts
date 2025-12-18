/**
 * Module Access Utilities - RBAC checks for different modules
 * Determines which roles can access which modules
 */

/**
 * Check if a role can access Recruitment module
 */
export function canAccessRecruitment(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  return (
    normalizedRole === 'system admin' ||
    normalizedRole === 'hr manager' ||
    normalizedRole === 'hr admin' ||
    normalizedRole === 'hr employee' ||
    normalizedRole === 'recruiter'
  );
}

/**
 * Check if a role can access Onboarding module
 */
export function canAccessOnboarding(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  return (
    normalizedRole === 'system admin' ||
    normalizedRole === 'hr manager' ||
    normalizedRole === 'hr admin' ||
    normalizedRole === 'hr employee'
  );
}

/**
 * Check if a role can access Offboarding module
 */
export function canAccessOffboarding(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  return (
    normalizedRole === 'system admin' ||
    normalizedRole === 'hr manager' ||
    normalizedRole === 'hr admin' ||
    normalizedRole === 'hr employee'
  );
}

/**
 * Check if a role can access Employee Management module
 * Note: Regular employees (department employee) can only access their own profile via /employee/profile
 * This function checks for full Employee Management module access (directory, team management, etc.)
 */
export function canAccessEmployeeManagement(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  return (
    normalizedRole === 'system admin' ||
    normalizedRole === 'hr manager' ||
    normalizedRole === 'hr admin' ||
    normalizedRole === 'hr employee' ||
    normalizedRole === 'department head'
    // department employee excluded - they can only access their own profile
  );
}

/**
 * Check if a role can access Payroll module
 */
export function canAccessPayroll(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  return (
    normalizedRole === 'system admin' ||
    normalizedRole === 'hr manager' ||
    normalizedRole === 'hr admin' ||
    normalizedRole === 'payroll specialist' ||
    normalizedRole === 'payroll manager' ||
    normalizedRole === 'finance staff'
  );
}

/**
 * Check if a role can access Time Management module
 * Note: Regular employees (department employee) can access leaves but not full time management dashboard
 */
export function canAccessTimeManagement(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  return (
    normalizedRole === 'system admin' ||
    normalizedRole === 'hr manager' ||
    normalizedRole === 'hr admin' ||
    normalizedRole === 'hr employee' ||
    normalizedRole === 'department head'
    // department employee excluded - they can only access leaves module
  );
}

/**
 * Check if a role can access Leaves module
 */
export function canAccessLeaves(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  return (
    normalizedRole === 'system admin' ||
    normalizedRole === 'hr manager' ||
    normalizedRole === 'hr admin' ||
    normalizedRole === 'department head' ||
    normalizedRole === 'department employee'
  );
}

/**
 * Check if a role can access Performance module
 */
export function canAccessPerformance(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  return (
    normalizedRole === 'system admin' ||
    normalizedRole === 'hr manager' ||
    normalizedRole === 'hr admin' ||
    normalizedRole === 'department head' ||
    normalizedRole === 'department employee'
  );
}

/**
 * Check if a role can access Organization Structure module
 */
export function canAccessOrganizationStructure(role: string | null | undefined): boolean {
  if (!role) return false;
  // All authenticated users can access organization structure
  return true;
}

/**
 * Check if a role can access Admin/User Management module
 */
export function canAccessAdmin(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  return (
    normalizedRole === 'system admin' ||
    normalizedRole === 'hr admin'
  );
}

