import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
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
        console.log('User roles:', userRoles);
        return requiredRoles.some((role) => userRoles.includes(role));
    }
}
