import { supabase } from '@/lib/supabase'
import { UserProfileData, UserInput } from '@/types/admin'
import { logActivity } from './activityLogger'

export const usersAdminService = {
  getAllUsers: async (filters?: { query?: string, role?: string }): Promise<UserProfileData[]> => {
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

  createUser: async (data: UserInput): Promise<boolean> => {
    // If we use create_generic_user_bypassing_auth 
    const { data: newUserId, error } = await supabase.rpc('create_generic_user_bypassing_auth', {
      p_email: data.email,
      p_password: data.password || 'SimmasApp123!',
      p_nama: data.fullName,
      p_role: data.role,
      p_is_verified: data.isVerified
    })

    if (error) {
      console.error('Error creating user via RPC:', error)
      return false
    }
    
    await logActivity('Create', 'Pengguna', newUserId as string, data)
    return true
  },

  updateUser: async (id: string, data: Partial<UserInput>): Promise<boolean> => {
    // Requires email, nama, role, isVerified since we don't have patch support on the RPC yet
    // we assume the caller provides all fields that were not changed.
    if (!data.email || !data.fullName || !data.role) return false;
    
    // update password separately if needed. If user wants to update password, we'd need another RPC,
    // but the UI currently doesn't allow editing password on update, let's assume it doesn't. Admin can edit name/role/email.
    const { error } = await supabase.rpc('update_user_bypassing_auth', {
      p_user_id: id,
      p_email: data.email,
      p_nama: data.fullName,
      p_role: data.role,
      p_is_verified: data.isVerified === undefined ? true : data.isVerified
    })

    if (error) {
      console.error('Error updating user via RPC:', error)
      return false
    }
    
    await logActivity('Update', 'Pengguna', id, data)
    return true
  },

  deleteUser: async (id: string): Promise<boolean> => {
    const { error } = await supabase.rpc('delete_user_bypassing_auth', {
      p_user_id: id
    })

    if (error) {
      console.error('Error deleting user:', error)
      return false
    }
    
    await logActivity('Delete', 'Pengguna', id, { id })
    return true
  }
}
