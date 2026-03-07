/**
 * Auth DTOs — Login, register, invite management.
 */
import type { UserRole } from '../enums';

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
  };
}

export interface RegisterViaInviteDto {
  token: string;
  fullName: string;
  email: string;
  password: string;
}

export interface CreateInviteDto {
  email?: string;
  role: UserRole;
  expiresInHours?: number;
}

export interface InviteResponse {
  id: string;
  token: string;
  inviteUrl: string;
  expiresAt: string;
  role: UserRole;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequestDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}
