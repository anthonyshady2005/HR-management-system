import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    /**
     * Normalize role string for case-insensitive comparison
     */
    private normalizeRole(role: string): string {
        return (role ?? '').toString().trim().toLowerCase();
    }

    /**
     * Check if a role exists in a list of roles (case-insensitive)
     */
    private roleExistsIn(role: string, roleList: string[]): boolean {
        const normalizedRole = this.normalizeRole(role);
        return roleList.some(r => this.normalizeRole(r) === normalizedRole);
    }

    /**
     * Check if any role from roleList1 exists in roleList2 (case-insensitive)
     */
    private hasAnyMatchingRole(roleList1: string[], roleList2: string[]): boolean {
        return roleList1.some(r1 => this.roleExistsIn(r1, roleList2));
    }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true; // No roles required, allow access
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            return false;
        }

        // Support both user.roles (array) and user.role (single string)
        const userRoles: string[] = Array.isArray(user.roles)
            ? user.roles
            : typeof user.role === 'string'
              ? [user.role]
              : [];

        // Extract X-Current-Role header
        const currentRole = request.headers['x-current-role'] as string | undefined;

        // If X-Current-Role is provided, validate it
        if (currentRole) {
            // Verify that the current role exists in user's JWT roles (case-insensitive)
            if (!this.roleExistsIn(currentRole, userRoles)) {
                throw new ForbiddenException(
                    `Invalid current role: "${currentRole}" is not assigned to this user`
                );
            }

            // Check if the current role satisfies the required roles (case-insensitive)
            if (this.roleExistsIn(currentRole, requiredRoles)) {
                return true;
            }

            // Fallback: If X-Current-Role doesn't match required roles,
            // check if user has ANY of the required roles in their assigned roles
            if (this.hasAnyMatchingRole(userRoles, requiredRoles)) {
                return true;
            }

            throw new ForbiddenException(
                `Current role "${currentRole}" does not have permission to access this resource. Required roles: ${requiredRoles.join(', ')}`
            );
        }

        // Fallback: If no X-Current-Role header, check if user has ANY of the required roles (case-insensitive)
        const hasRequiredRole = this.hasAnyMatchingRole(userRoles, requiredRoles);

        if (!hasRequiredRole) {
            throw new ForbiddenException(
                `Access denied. Required roles: ${requiredRoles.join(', ')}. User roles: ${userRoles.join(', ')}`
            );
        }

        return hasRequiredRole;
    }
}
