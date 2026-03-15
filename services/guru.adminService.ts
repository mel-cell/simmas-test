import { createClient as createServerClient } from '@/lib/supabaseServer'
import { TeacherStats, GuruData, GuruInput } from '@/types/admin'
import { logActivity } from './activityLogger'

export const guruAdminService = {
  getTeacherStats: async (): Promise<TeacherStats> => {
    const supabase = await createServerClient()
    // 1. Total Guru
    const { count: total } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'GURU')

    // 2. Guru Aktif
    const { count: aktif } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'GURU')
      .eq('status', 'aktif')

    // 3. Total Siswa Bimbingan (count rows in magang)
    const { count: totalBimbingan } = await supabase
      .from('magang')
      .select('*', { count: 'exact', head: true })
    
    // 4. Rata-rata Siswa (Total Bimbingan / Total Guru)
    const rataRataSiswa = total && total > 0 ? Math.round((totalBimbingan || 0) / total) : 0

    return {
      total: total || 0,
      aktif: aktif || 0,
      totalBimbingan: totalBimbingan || 0,
      rataRataSiswa
    }
  },

  getAllGuru: async (filters?: { query?: string, status?: string, mataPelajaran?: string }): Promise<GuruData[]> => {
    const supabase = await createServerClient()
    let query = supabase
      .from('profiles')
      .select(`
        id,
        nomor_induk,
        full_name,
        jurusan,
        email,
        no_telp,
        status,
        alamat,
        magang_count:magang!magang_guru_id_fkey(count)
      `)
      .eq('role', 'GURU')

    if (filters?.query) {
      query = query.or(`full_name.ilike.%${filters.query}%,nomor_induk.ilike.%${filters.query}%`)
    }

    if (filters?.status && filters.status !== 'semua') {
      query = query.eq('status', filters.status)
    }

    if (filters?.mataPelajaran && filters.mataPelajaran !== 'semua') {
      query = query.eq('jurusan', filters.mataPelajaran)
    }

    const { data, error } = await query.order('full_name')

    if (error) {
      console.error('Failed to fetch teachers:', error)
      return []
    }
    if (!data) return []

    return data.map((g: {
      id: string;
      nomor_induk: string | null;
      full_name: string;
      jurusan: string | null;
      email: string | null;
      no_telp: string | null;
      status: string | null;
      alamat: string | null;
      magang_count: { count: number }[];
    }) => ({
      id: g.id,
      nip: g.nomor_induk || '-',
      nama: g.full_name,
      mataPelajaran: g.jurusan || 'Tidak Diatur',
      email: g.email || '-',
      nohp: g.no_telp || '-',
      totalSiswa: g.magang_count && g.magang_count.length > 0 ? g.magang_count[0].count : 0,
      status: g.status || 'aktif',
      alamat: g.alamat || ''
    }))
  },

  createGuru: async (data: GuruInput): Promise<{ success: boolean, error?: string }> => {
    try {
      const supabase = await createServerClient()
      const finalPassword = data.password || (data.nip.trim() + '!SimmasG123')
      const email = data.email.trim().toLowerCase()
      
      const { data: newUserId, error } = await supabase.rpc('create_guru_bypassing_auth', {
        p_email: email,
        p_password: finalPassword,
        p_nama: data.nama.trim(),
        p_nip: data.nip.trim(),
        p_nohp: data.nohp.trim(),
        p_mata_pelajaran: data.mataPelajaran,
        p_alamat: data.alamat || '',
        p_status: data.status || 'aktif'
      })

      if (error) {
        console.error('Error in createGuru RPC:', error)
        return { success: false, error: error.message }
      }

      if (newUserId) {
        await logActivity('Create', 'GURU', newUserId, data)
        return { success: true }
      }
      return { success: false, error: 'Gagal membuat data guru' }
    } catch (error) {
      console.error('Error in createGuru:', error)
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, error: message }
    }
  },

  updateGuru: async (id: string, data: Partial<GuruInput>): Promise<{ success: boolean, error?: string }> => {
    try {
      const supabase = await createServerClient()
      const email = data.email ? data.email.trim().toLowerCase() : undefined
      
      const { data: current } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
      
      if (!current) return { success: false, error: 'Guru tidak ditemukan' }

      const { error: rpcError } = await supabase.rpc('update_user_bypassing_auth', {
        p_user_id: id,
        p_email: email || current.email,
        p_nama: data.nama?.trim() || current.full_name,
        p_role: 'GURU',
        p_is_verified: true,
        p_password: data.password || null
      })

      if (rpcError) {
        console.error('Error in updateGuru RPC:', rpcError)
        return { success: false, error: rpcError.message }
      }

      const updateProfileData: Record<string, string | null | undefined> = {}
      if (data.nip !== undefined) updateProfileData.nomor_induk = data.nip.trim()
      if (data.nohp !== undefined) updateProfileData.no_telp = data.nohp.trim()
      if (data.mataPelajaran !== undefined) updateProfileData.jurusan = data.mataPelajaran
      if (data.alamat !== undefined) updateProfileData.alamat = data.alamat
      if (data.status !== undefined) updateProfileData.status = data.status

      if (Object.keys(updateProfileData).length > 0) {
        await supabase.from('profiles').update(updateProfileData).eq('id', id)
      }

      await logActivity('Update', 'GURU', id, data)
      return { success: true }
    } catch (error) {
      console.error('Error in updateGuru:', error)
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, error: message }
    }
  },

  deleteGuru: async (id: string): Promise<{ success: boolean, error?: string }> => {
    try {
      const supabase = await createServerClient()
      const { error } = await supabase.rpc('delete_user_bypassing_auth', {
        p_user_id: id
      })

      if (!error) {
        await logActivity('Delete', 'GURU', id, { id })
        return { success: true }
      }
      console.error('Error in deleteGuru RPC:', error)
      return { success: false, error: error.message }
    } catch (error) {
      console.error('Error in deleteGuru:', error)
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, error: message }
    }
  }
}
