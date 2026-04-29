import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id:    string
  code:  string
  name:  string
  email: string
  role:  string
}

export interface AuthStore {
  token:     string | null
  user:      AuthUser | null
  setAuth:   (token: string, user: AuthUser) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token:     null,
      user:      null,
      setAuth:   (token, user) => set({ token, user }),
      clearAuth: ()            => set({ token: null, user: null }),
    }),
    { name: 'maqpos-auth' }
  )
)