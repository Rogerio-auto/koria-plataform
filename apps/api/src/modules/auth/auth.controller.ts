import { Controller, Post, Get, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email/password' })
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('refresh')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Refresh JWT token' })
  async refresh(@CurrentUser() user: { id: string }) {
    return this.authService.refreshToken(user.id);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user info' })
  async me(@CurrentUser() user: { id: string }) {
    return this.authService.getMe(user.id);
  }

  @Get('invite/validate/:token')
  @ApiOperation({ summary: 'Validate an invite token' })
  async validateInvite(@Param('token') token: string) {
    const invite = await this.authService.validateInviteToken(token);
    return { valid: true, role: invite.role, email: invite.email };
  }

  @Post('register')
  @ApiOperation({ summary: 'Register via invite token' })
  async register(
    @Body() body: { token: string; fullName: string; email?: string; password: string },
  ) {
    return this.authService.registerViaInvite(body.token, body.fullName, body.email, body.password);
  }

  @Post('invites')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create an invite link' })
  async createInvite(
    @CurrentUser() user: { id: string; role: string },
    @TenantId() tenantId: string,
    @Body() body: { email?: string; role: string; expiresInHours?: number },
  ) {
    if (user.role === 'manager' && !['sdr', 'viewer'].includes(body.role)) {
      return { error: 'Managers can only invite SDR and Viewer roles' };
    }
    return this.authService.createInvite(
      user.id,
      tenantId,
      body.role,
      body.email,
      body.expiresInHours,
    );
  }

  @Get('invites')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'List all invites' })
  async listInvites(@TenantId() tenantId: string) {
    return this.authService.listInvites(tenantId);
  }

  @Get('users')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'List all users' })
  async listUsers(@TenantId() tenantId: string) {
    return this.authService.listUsers(tenantId);
  }

  @Post('change-password')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Change current user password' })
  async changePassword(
    @CurrentUser() user: { id: string },
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(user.id, body.currentPassword, body.newPassword);
  }
}
