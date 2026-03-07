import {
  Injectable,
  Inject,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { eq, and, gt, isNull } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE_CONNECTION } from '../database/database.module';
import { analyticsUsers, inviteTokens } from '@koria/database';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: PostgresJsDatabase,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex');
    return new Promise((resolve, reject) => {
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) reject(err);
        resolve(`${salt}:${derivedKey.toString('hex')}`);
      });
    });
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    const [salt, key] = hash.split(':');
    if (!salt || !key) return false;
    return new Promise((resolve, reject) => {
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) reject(err);
        resolve(crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey));
      });
    });
  }

  async login(email: string, password: string) {
    const result = await this.db
      .select()
      .from(analyticsUsers)
      .where(eq(analyticsUsers.email, email.toLowerCase().trim()))
      .limit(1);

    const user = result[0];
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.status !== 'active') throw new UnauthorizedException('Account is inactive');

    const isValid = await this.verifyPassword(password, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    await this.db
      .update(analyticsUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(analyticsUsers.id, user.id));

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  async getMe(userId: string) {
    const result = await this.db
      .select({
        id: analyticsUsers.id,
        email: analyticsUsers.email,
        fullName: analyticsUsers.fullName,
        role: analyticsUsers.role,
        tenantId: analyticsUsers.tenantId,
        createdAt: analyticsUsers.createdAt,
        lastLoginAt: analyticsUsers.lastLoginAt,
      })
      .from(analyticsUsers)
      .where(eq(analyticsUsers.id, userId))
      .limit(1);

    if (!result[0]) throw new NotFoundException('User not found');
    return result[0];
  }

  async refreshToken(userId: string) {
    const user = await this.getMe(userId);
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };
    return { access_token: this.jwtService.sign(payload) };
  }

  async validateInviteToken(token: string) {
    const result = await this.db
      .select()
      .from(inviteTokens)
      .where(
        and(
          eq(inviteTokens.token, token),
          isNull(inviteTokens.usedAt),
          gt(inviteTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    const invite = result[0];
    if (!invite) throw new BadRequestException('Invalid or expired invite token');
    return invite;
  }

  async registerViaInvite(token: string, fullName: string, email: string | undefined, password: string) {
    const invite = await this.validateInviteToken(token);

    const finalEmail = (email || invite.email || '').toLowerCase().trim();
    if (!finalEmail) {
      throw new BadRequestException('Email is required');
    }
    if (invite.email && invite.email.toLowerCase() !== finalEmail) {
      throw new BadRequestException('Email does not match the invite');
    }

    const existing = await this.db
      .select({ id: analyticsUsers.id })
      .from(analyticsUsers)
      .where(eq(analyticsUsers.email, finalEmail))
      .limit(1);

    if (existing[0]) throw new ConflictException('Email already registered');

    const passwordHash = await this.hashPassword(password);

    const inserted = await this.db
      .insert(analyticsUsers)
      .values({
        tenantId: invite.tenantId,
        email: finalEmail,
        passwordHash,
        fullName: fullName.trim(),
        role: invite.role,
        status: 'active',
      })
      .returning({
        id: analyticsUsers.id,
        email: analyticsUsers.email,
        fullName: analyticsUsers.fullName,
        role: analyticsUsers.role,
      });

    const user = inserted[0];
    if (!user) throw new BadRequestException('Failed to create user');

    await this.db
      .update(inviteTokens)
      .set({ usedAt: new Date(), usedBy: user.id })
      .where(eq(inviteTokens.id, invite.id));

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: invite.tenantId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: invite.tenantId,
      },
    };
  }

  async createInvite(
    creatorId: string,
    tenantId: string,
    role: string,
    email?: string,
    expiresInHours = 48,
  ) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const dashboardUrl = this.config.get<string>('DASHBOARD_URL') || 'http://localhost:5174';

    const inserted = await this.db
      .insert(inviteTokens)
      .values({
        tenantId,
        token,
        email: email?.toLowerCase().trim() ?? null,
        role: role as 'admin' | 'manager' | 'sdr' | 'viewer',
        createdBy: creatorId,
        expiresAt,
      })
      .returning();

    return {
      id: inserted[0]!.id,
      token,
      inviteUrl: `${dashboardUrl}/invite/${token}`,
      expiresAt: expiresAt.toISOString(),
      role,
    };
  }

  async listInvites(tenantId: string) {
    return this.db
      .select()
      .from(inviteTokens)
      .where(eq(inviteTokens.tenantId, tenantId))
      .orderBy(inviteTokens.createdAt);
  }

  async listUsers(tenantId: string) {
    return this.db
      .select({
        id: analyticsUsers.id,
        email: analyticsUsers.email,
        fullName: analyticsUsers.fullName,
        role: analyticsUsers.role,
        status: analyticsUsers.status,
        createdAt: analyticsUsers.createdAt,
        lastLoginAt: analyticsUsers.lastLoginAt,
      })
      .from(analyticsUsers)
      .where(eq(analyticsUsers.tenantId, tenantId))
      .orderBy(analyticsUsers.createdAt);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const result = await this.db
      .select({ passwordHash: analyticsUsers.passwordHash })
      .from(analyticsUsers)
      .where(eq(analyticsUsers.id, userId))
      .limit(1);

    if (!result[0]) throw new NotFoundException('User not found');

    const isValid = await this.verifyPassword(currentPassword, result[0].passwordHash);
    if (!isValid) throw new UnauthorizedException('Current password is incorrect');

    const newHash = await this.hashPassword(newPassword);
    await this.db
      .update(analyticsUsers)
      .set({ passwordHash: newHash })
      .where(eq(analyticsUsers.id, userId));

    return { success: true };
  }
}
