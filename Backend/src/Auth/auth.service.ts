import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserProfileBase } from '../employee-profile/models/user-schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserProfileBase.name) private userModel: Model<UserProfileBase>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userModel.findOne({ personalEmail: dto.personalEmail });
    if (existing) throw new ConflictException('User already exists');

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.userModel.create({
      ...dto,
      fullName: `${dto.firstName} ${dto.lastName}`,
      password: hashed,
    });

    return { message: 'Registration successful' };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ personalEmail: dto.personalEmail });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({
      sub: user._id,
      email: user.personalEmail,
      roleId: user.accessProfileId,
    });

    return {
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.personalEmail,
      },
    };
  }
}
