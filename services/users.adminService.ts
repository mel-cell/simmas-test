import { createClient as createServerClient } from '@/lib/supabaseServer'
import { UserProfileData, UserInput } from '@/types/admin'
import { logActivity } from './activityLogger'

export const usersAdminService = {
  getAllUsers: async (filters?: { query?: string, role?: string }): Promise<UserProfileData[]> => {
    const supabase = await createServerClient()
    const { data, error } = await supabase.rpc('get_all_users_admin')

    if (error) {
      console.error('Failed to fetch users:', error)
      return []
    }
    if (!data) return []

    let results = data as { id: string; full_name: string; email: string; role: string; is_verified: boolean; created_at: string }[]

    if (filters?.role && filters.role !== 'semua') {
      results = results.filter(u => u.role.toLowerCase() === filters.role!.toLowerCase())
    }

    if (filters?.query) {
      const q = filters.query.toLowerCase()
      results = results.filter(u => 
        u.full_name?.toLowerCase().includes(q) || 
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
      )
    }

    return results.map(u => ({
      id: u.id,
      fullName: u.full_name || 'Tidak diketahui',
      email: u.email || '-',
      role: u.role || 'SISWA',
      isVerified: u.is_verified || false,
      createdAt: u.created_at || new Date().toISOString()
    }))
  },

  createUser: async (data: UserInput): Promise<{ success: boolean, error?: string }> => {
    try {
      const { data: newUserId, error } = await (await createServerClient()).rpc('create_generic_user_bypassing_auth', {
        p_email: data.email.trim().toLowerCase(),
        p_password: data.password || 'SimmasApp123!',
        p_nama: data.fullName.trim(),
        p_role: data.role.toUpperCase(),
        p_is_verified: data.isVerified
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (newUserId) {
        await logActivity('Create', 'PENGGUNA', newUserId, data)
        return { success: true }
      }
      return { success: false, error: 'Gagal membuat user' }
    } catch (error) {
      console.error('Error in createUser:', error)
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, error: message || 'Terjadi kesalahan sistem' }
    }
  },

  updateUser: async (id: string, data: Partial<UserInput>): Promise<{ success: boolean, error?: string }> => {
    try {
      const supabase = await createServerClient()
      
      // Get current data
      const { data: current } = await supabase.from('profiles').select('*').eq('id', id).single()
      if (!current) return { success: false, error: 'User tidak ditemukan' }

      const { error } = await supabase.rpc('update_user_bypassing_auth', {
        p_user_id: id,
        p_email: data.email?.trim().toLowerCase() || current.email,
        p_nama: data.fullName?.trim() || current.full_name,
        p_role: data.role?.toUpperCase() || (current.role as string).toUpperCase(),
        p_is_verified: data.isVerified ?? true,
        p_password: data.password || null
      })

      if (error) {
        return { success: false, error: error.message }
      }

      await logActivity('Update', 'PENGGUNA', id, data)
      return { success: true }
    } catch (error) {
      console.error('Error in updateUser:', error)
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, error: message || 'Terjadi kesalahan sistem' }
    }
  },

  deleteUser: async (id: string): Promise<{ success: boolean, error?: string }> => {
    try {
      const supabase = await createServerClient()
      const { error } = await supabase.rpc('delete_user_bypassing_auth', {
        p_user_id: id
      })

      if (!error) {
        await logActivity('Delete', 'PENGGUNA', id, { id })
        return { success: true }
      }
      return { success: false, error: error.message }
    } catch (error) {
      console.error('Error in deleteUser:', error)
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, error: message }
    }
  }
}
