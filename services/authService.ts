import { supabase } from '@/lib/supabase'
import { LoginCredentials, AuthResponse } from '@/types/auth'

export const authService = {
  async signIn({ email, password }: LoginCredentials): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Ambil detail profil untuk mendapatkan role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', data.user.id)
      .single()

    if (profileError) throw profileError

    return {
      user: data.user,
      profile: profile
    }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }
}
