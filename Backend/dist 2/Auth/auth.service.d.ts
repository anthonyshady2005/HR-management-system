import { JwtService } from '@nestjs/jwt';
import { Model, Types } from 'mongoose';
import { EmployeeProfile } from '../employee-profile/models/employee-profile.schema';
import { EmployeeSystemRole } from '../employee-profile/models/employee-system-role.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private userModel;
    private roleModel;
    private jwtService;
    constructor(userModel: Model<EmployeeProfile>, roleModel: Model<EmployeeSystemRole>, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        message: string;
    }>;
    login(dto: LoginDto): Promise<{
        message: string;
        token: string;
        user: {
            id: Types.ObjectId;
            fullName: string | undefined;
            email: string | undefined;
            roles: import("../employee-profile/enums/employee-profile.enums").SystemRole[];
        };
    }>;
}
