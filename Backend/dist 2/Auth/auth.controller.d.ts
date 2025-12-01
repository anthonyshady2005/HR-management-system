import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { Response } from 'express';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        message: string;
    }>;
    login(dto: LoginDto, res: Response): Promise<{
        message: string;
        user: {
            id: import("mongoose").Types.ObjectId;
            fullName: string | undefined;
            email: string | undefined;
            roles: import("../employee-profile/enums/employee-profile.enums").SystemRole[];
        };
    }>;
}
