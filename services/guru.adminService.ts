import { supabase } from '@/lib/supabase'
import { TeacherStats, GuruData, GuruInput } from '@/types/admin'

export const guruAdminService = {
  getTeacherStats: async (): Promise<TeacherStats> => {
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

  getAllGuru: async (filters?: { query?: string, status?: string }): Promise<GuruData[]> => {
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

  createGuru: async (data: GuruInput): Promise<boolean> => {
    try {
      const dummyPassword = data.nip + '!SimmasG123'
      
      const { error } = await supabase.rpc('create_guru_bypassing_auth', {
        p_email: data.email,
        p_password: dummyPassword,
        p_nama: data.nama,
        p_nip: data.nip,
        p_nohp: data.nohp,
        p_mata_pelajaran: data.mataPelajaran,
        p_alamat: data.alamat || null,
        p_status: data.status || 'aktif'
      })

      if (error) {
        console.error('Error creating teacher via RPC:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in createGuru:', error)
      return false
    }
  },

  updateGuru: async (id: string, data: Partial<GuruInput>): Promise<boolean> => {
    const { error: pError } = await supabase
      .from('profiles')
      .update({
        nomor_induk: data.nip,
        full_name: data.nama,
        email: data.email,
        no_telp: data.nohp,
        jurusan: data.mataPelajaran,
        alamat: data.alamat,
        status: data.status || 'aktif'
      })
      .eq('id', id)
      .eq('role', 'GURU')

    if (pError) {
      console.error('Error updating profile:', pError)
      return false
    }
    return true
  },

  deleteGuru: async (id: string): Promise<boolean> => {
    // Also set null to guru_id in magang where necessary
    await supabase.from('magang').update({ guru_id: null }).eq('guru_id', id)
    
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)
      .eq('role', 'GURU')

    return !error
  }
}
