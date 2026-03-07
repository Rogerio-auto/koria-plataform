/**
 * Auth store — manages JWT token and user info.
 */
import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'sdr' | 'viewer';
  tenantId: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

const storedToken = localStorage.getItem('koria_token');
const storedUser = (() => {
  try {
    const raw = localStorage.getItem('koria_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

export const useAuthStore = create<AuthState>((set) => ({
  token: storedToken,
  user: storedUser,
  isAuthenticated: !!storedToken,
  setAuth: (token, user) => {
    localStorage.setItem('koria_token', token);
    localStorage.setItem('koria_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },
  setUser: (user) => {
    localStorage.setItem('koria_user', JSON.stringify(user));
    set({ user });
  },
  logout: () => {
    localStorage.removeItem('koria_token');
    localStorage.removeItem('koria_user');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
