/**
 * Utility functions for role-based access control
 * Based on organization structure module permissions
 */

/**
 * Roles that have access to organization structure module APIs
 * Based on backend controllers: organization-structure.controller.ts and structure-change-request.controller.ts
 */
const ORGANIZATION_STRUCTURE_ROLES = [
  'System Admin',
  'HR Manager',
  'HR Admin',
  'department head', // Maps to 'Manager' in some backend endpoints
  'department employee', // Maps to 'Employee' in some backend endpoints
] as const;

/**
 * Check if a role has access to organization structure module
 * @param role - The role to check
 * @returns true if the role has org structure permissions, false otherwise
 */
export function hasOrganizationStructureAccess(role: string | null | undefined): boolean {
  if (!role) return false;
  return ORGANIZATION_STRUCTURE_ROLES.some((orgRole) => 
    role.toLowerCase() === orgRole.toLowerCase()
  );
}
