/**
 * Auth module — JWT authentication for dashboard/internal users.
 * TODO: Implement JWT strategy, login, refresh token
 */
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
