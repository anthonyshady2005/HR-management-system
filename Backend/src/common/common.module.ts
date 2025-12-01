import { Module } from '@nestjs/common';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  providers: [LoggerMiddleware, JwtAuthGuard, RolesGuard],
  exports: [LoggerMiddleware, JwtAuthGuard, RolesGuard],
})
export class CommonModule {}

