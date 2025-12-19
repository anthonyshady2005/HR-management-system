import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context?: ExecutionContext) {
    // Log error details in production for debugging
    if (err) {
      console.error('[JwtAuthGuard] Error:', err.message || err);
      throw err;
    }
    
    if (!user) {
      // Log detailed info for debugging (JWT might be missing, expired, or invalid)
      let requestDetails = {};
      if (context) {
        const request = context.switchToHttp().getRequest();
        requestDetails = {
          hasCookies: !!request?.cookies,
          cookieKeys: request?.cookies ? Object.keys(request.cookies) : [],
          hasAuthToken: !!request?.cookies?.auth_token,
          hasAuthHeader: !!request?.headers?.authorization,
        };
      }
      console.error('[JwtAuthGuard] No user found. Info:', {
        message: info?.message || 'Token validation failed',
        name: info?.name,
        ...requestDetails,
      });
      throw new UnauthorizedException('Invalid or expired token. Please login again.');
    }
    
    return user;
  }
}
