import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserProfileBase, UserProfileBaseSchema } from '../Employee-profile/models/user-schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserProfileBase.name, schema: UserProfileBaseSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'DEFAULT_SECRET',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
