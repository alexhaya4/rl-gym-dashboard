import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  role: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  setAuth: (token: string, user: User) => void;
  setRbac: (role: string, permissions: string[]) => void;
  logout: () => void;
  setUser: (user: User) => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      role: null,
      permissions: [],
      isAuthenticated: false,
      setToken: (token) => set({ token }),
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      setRbac: (role, permissions) => set({ role, permissions }),
      logout: () =>
        set({
          token: null,
          user: null,
          role: null,
          permissions: [],
          isAuthenticated: false,
        }),
      setUser: (user) => set({ user }),
      hasPermission: (permission) => {
        const { role, permissions } = get();
        if (role === 'admin') return true;
        return permissions.includes(permission);
      },
    }),
    {
      name: 'rl-gym-auth',
    }
  )
);
