import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/user.types'

interface AuthStore {
  user: User | null
  accessToken: string | null
  setAuth: (user: User, token: string) => void
  setAccessToken: (token: string) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,

      setAuth: (user, token) => set({ user, accessToken: token }),

      setAccessToken: (token) => set({ accessToken: token }),

      clearAuth: () => set({ user: null, accessToken: null }),

      isAuthenticated: () => get().accessToken !== null && get().user !== null,

      isAdmin: () => get().user?.role === 'ADMIN',
    }),
    {
      name: 'nybutik-auth',
      partialize: (state) => ({ user: state.user }),
      // accessToken memory'de kalır (localStorage'a yazılmaz — güvenlik)
    }
  )
)
