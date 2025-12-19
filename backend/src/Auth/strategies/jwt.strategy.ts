import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeProfile } from '../../employee-profile/models/employee-profile.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(@InjectModel(EmployeeProfile.name) private userModel: Model<EmployeeProfile>) {
        super({
            // Extract JWT from cookie `auth_token` or Authorization header
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req) => req?.cookies?.auth_token,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'DEFAULT_SECRET',
        });
    }

    async validate(payload: any) {
        // Validate payload has required fields
        if (!payload || !payload.sub) {
            console.error('[JwtStrategy] Invalid payload:', payload);
            throw new UnauthorizedException('Invalid token payload');
        }

        const user = await this.userModel.findById(payload.sub).exec();
        if (!user) {
            console.error('[JwtStrategy] User not found for ID:', payload.sub);
            throw new UnauthorizedException('User not found');
        }

        // Attach only the required properties to request.user
        // Ensure roles array is always present on request.user
        const rolesArray = Array.isArray(payload.roles)
            ? payload.roles
            : payload.role
                ? [payload.role]
                : [];

        // Ensure we always return an array for roles (even if empty)
        const result = {
            _id: user._id,
            sub: user._id.toString(),
            roles: rolesArray.length > 0 ? rolesArray : [],
        };

        // Log in production if roles are empty (for debugging)
        if (process.env.NODE_ENV === 'production' && result.roles.length === 0) {
            console.warn('[JwtStrategy] User has no roles:', user._id);
        }

        return result;
    }
}
