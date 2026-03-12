import { createClient as createServerClient } from '@/lib/supabaseServer'

export const authServerService = {
  async getProfile() {
    const supabase = await createServerClient()
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
  }
}
