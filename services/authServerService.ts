import { createClient as createServerClient } from '@/lib/supabaseServer'

export const authServerService = {
  async getProfile() {
    const supabase = await createServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return null

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.warn('Profile record not found for auth user ID:', user.id);
      return {
        user: user,
        profile: null
      }
    }

    return {
      user: user,
      profile: profile
    }
  }
}
