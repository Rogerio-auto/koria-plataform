/**
 * Auth store — manages JWT token and user info.
 * TODO: Implement login, logout, token refresh, user profile.
 */
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: unknown | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  setToken: (token) => set({ token, isAuthenticated: true }),
  logout: () => set({ token: null, user: null, isAuthenticated: false }),
}));
