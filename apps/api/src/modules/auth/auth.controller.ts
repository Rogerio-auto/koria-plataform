import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email/password' })
  async login(@Body() _body: unknown) {
    // TODO: Implement login
    return { message: 'Login endpoint — not yet implemented' };
  }

  @Post('refresh')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh JWT token' })
  async refresh() {
    // TODO: Implement token refresh
    return { message: 'Refresh endpoint — not yet implemented' };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  async me() {
    // TODO: Implement with JWT guard
    return { message: 'Me endpoint — not yet implemented' };
  }
}
