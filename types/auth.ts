import { User } from '@supabase/supabase-js'

export type UserRole = 'ADMIN' | 'GURU' | 'SISWA'

export interface Profile {
  full_name: string
  role: UserRole
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  profile: Profile
}
