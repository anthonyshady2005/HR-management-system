import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserProfileBase, UserProfileBaseSchema } from '../employee-profile/models/user-schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserProfileBase.name, schema: UserProfileBaseSchema }]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'DEFAULT_SECRET',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
