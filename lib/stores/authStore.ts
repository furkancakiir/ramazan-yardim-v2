import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import type { KullaniciProfili, UserRole } from '@/types/database.types'

interface AuthState {
  user: User | null
  profile: KullaniciProfili | null
  loading: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: KullaniciProfili | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void
  isAdmin: () => boolean
  isMahalleBaskani: () => boolean
  isKullanici: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  
  reset: () => set({ user: null, profile: null, loading: false }),

  isAdmin: () => get().profile?.rol === 'admin',
  isMahalleBaskani: () => get().profile?.rol === 'mahalle_baskani',
  isKullanici: () => get().profile?.rol === 'kullanici',
}))
