import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EmployeeProfile } from '../employee-profile/models/employee-profile.schema';
import { EmployeeSystemRole } from '../employee-profile/models/employee-system-role.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(EmployeeProfile.name) private userModel: Model<EmployeeProfile>,
        @InjectModel(EmployeeSystemRole.name) private roleModel: Model<EmployeeSystemRole>,
        private jwtService: JwtService,
    ) {}

    async register(dto: RegisterDto) {
        const existing = await this.userModel.findOne({ personalEmail: dto.personalEmail });
        if (existing) throw new ConflictException('User already exists');

        const hashed = await bcrypt.hash(dto.password, 10);
        const now = new Date();
        const employeeNumber = `EMP-${now.getTime()}`;

        const user = await this.userModel.create({
            firstName: dto.firstName,
            lastName: dto.lastName,
            fullName: `${dto.firstName} ${dto.lastName}`,
            nationalId: dto.nationalId,
            personalEmail: dto.personalEmail,
            password: hashed,
            employeeNumber,
            dateOfHire: now,
            statusEffectiveFrom: now,
        } as Partial<EmployeeProfile>);

        // Initialize a role record for the user if none exists
        await this.roleModel.create({
            employeeProfileId: user._id as Types.ObjectId,
            roles: [],
            permissions: [],
            isActive: true,
        } as Partial<EmployeeSystemRole>);

        return { message: 'Registration successful' };
    }

    async login(dto: LoginDto) {
        const user = await this.userModel.findOne({ personalEmail: dto.personalEmail });
        if (!user || !user.password) throw new UnauthorizedException('Invalid credentials');

        const match = await bcrypt.compare(dto.password, user.password);
        if (!match) throw new UnauthorizedException('Invalid credentials');

        // Fetch roles assigned to this user (empty array if none)
        const roleDoc = await this.roleModel.findOne({ employeeProfileId: user._id });
        const roles = roleDoc?.roles ?? [];

        // Only include user id and roles in payload
        const token = this.jwtService.sign({ sub: user._id, roles });

        return {
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.personalEmail,
                roles,
            },
        };
    }
}
