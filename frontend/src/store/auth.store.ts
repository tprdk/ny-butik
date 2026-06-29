import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/user.types'

interface AuthStore {
  user: User | null
  accessToken: string | null
  initialized: boolean
  setAuth: (user: User, token: string) => void
  setAccessToken: (token: string) => void
  clearAuth: () => void
  setInitialized: (v: boolean) => void
  isAuthenticated: () => boolean
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      initialized: false,

      setAuth: (user, token) => set({ user, accessToken: token }),

      setAccessToken: (token) => set({ accessToken: token }),

      clearAuth: () => set({ user: null, accessToken: null }),

      setInitialized: (v) => set({ initialized: v }),

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
