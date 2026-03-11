import { supabase } from '@/lib/supabase'
import { LoginCredentials, AuthResponse } from '@/types/auth'

export const authService = {
  async signIn({ email, password }: LoginCredentials): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    if (!data.user) throw new Error('User tidak ditemukan')

    // Ambil detail profil untuk mendapatkan role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      // Jika profile missing tapi auth success, beri info jelas
      console.error('Profile missing for user ID:', data.user.id);
      throw new Error('Data profil Anda tidak ditemukan di database. Silakan hubungi admin sekolah.')
    }

    return {
      user: data.user,
      profile: profile
    }
  },

  async getProfile() {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) return null

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profileError) {
      console.warn('Profile record not found for auth session ID:', session.user.id);
      return {
        user: session.user,
        profile: null
      }
    }

    return {
      user: session.user,
      profile: profile
    }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }
}
