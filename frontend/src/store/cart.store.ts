import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartStore {
  isOpen: boolean
  sessionId: string
  open: () => void
  close: () => void
  toggle: () => void
}

function generateSessionId(): string {
  return 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      isOpen: false,
      sessionId: generateSessionId(),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    {
      name: 'cart-store',
      partialize: (s) => ({ sessionId: s.sessionId }),
    }
  )
)
