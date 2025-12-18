import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

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
            // Verify that the current role exists in user's JWT roles
            if (!userRoles.includes(currentRole)) {
                throw new ForbiddenException(
                    `Invalid current role: "${currentRole}" is not assigned to this user`
                );
            }

            // Check if the current role satisfies the required roles
            if (!requiredRoles.includes(currentRole)) {
                throw new ForbiddenException(
                    `Current role "${currentRole}" does not have permission to access this resource. Required roles: ${requiredRoles.join(', ')}`
                );
            }

            return true;
        }

        // Fallback: If no X-Current-Role header, check if user has ANY of the required roles
        // This maintains backward compatibility
        const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));

        if (!hasRequiredRole) {
            throw new ForbiddenException(
                `Access denied. Required roles: ${requiredRoles.join(', ')}. User roles: ${userRoles.join(', ')}`
            );
        }

        return hasRequiredRole;
    }
}
