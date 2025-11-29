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
        const user = await this.userModel.findById(payload.sub).exec();
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        // Attach only the required properties to request.user
        return {
            _id: user._id,
            role: Array.isArray(payload.roles) ? payload.roles : payload.role,
        };
    }
}
