import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const adminAuthService = {
  async createUser({ email, password, full_name, role }: { email: string, password?: string, full_name: string, role: string }) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: role.toUpperCase() }
    })
    
    if (error) throw error
    return data.user
  },

  async updateUser(id: string, { email, password, full_name, role }: { email?: string, password?: string, full_name?: string, role?: string }) {
    const updateData: {
      email?: string;
      password?: string;
      user_metadata?: {
        full_name?: string;
        role?: string;
      };
    } = {}
    if (email) updateData.email = email
    if (password) updateData.password = password
    if (full_name || role) {
      updateData.user_metadata = {
        ...(full_name ? { full_name } : {}),
        ...(role ? { role: role.toUpperCase() } : {})
      }
    }
    
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, updateData)
    
    if (error) throw error
    return data.user
  },

  async deleteUser(id: string) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
    if (error) throw error
    return true
  }
}
