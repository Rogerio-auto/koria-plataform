/**
 * Analytics User entity — dashboard system users.
 */
import type { UserRole, UserStatus } from '../enums';

export interface AnalyticsUser {
  id: string;
  tenantId: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface InviteToken {
  id: string;
  tenantId: string;
  token: string;
  email: string | null;
  role: UserRole;
  createdBy: string | null;
  expiresAt: string;
  usedAt: string | null;
  usedBy: string | null;
  createdAt: string;
}

export interface InviteTokenWithCreator extends InviteToken {
  creatorName: string | null;
}
