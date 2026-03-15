import { createClient as createServerClient } from '@/lib/supabaseServer'
import { StudentStats, SiswaData, SiswaInput } from '@/types/admin'
import { logActivity } from './activityLogger'

export const siswaAdminService = {
  getStudentStats: async (): Promise<StudentStats> => {
    const supabase = await createServerClient()
    // 1. Total Siswa
    const { count: total } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'SISWA')

    // 2. Sedang Magang
    const { count: sedangMagang } = await supabase
      .from('magang')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'aktif')

    // 3. Selesai Magang
    const { count: selesaiMagang } = await supabase
      .from('magang')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'selesai')

    // 4. Belum Ada Pembimbing (Siswa yang belum ada di tabel magang)
    const { data: allSiswaIds } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'SISWA')
    
    const { data: magangSiswaIds } = await supabase
      .from('magang')
      .select('siswa_id')

    const hasMagang = new Set((magangSiswaIds as { siswa_id: string }[])?.map(m => m.siswa_id) || [])
    const belumAdaPembimbing = ((allSiswaIds as { id: string }[])?.filter(s => !hasMagang.has(s.id)) || []).length

    return {
      total: total || 0,
      sedangMagang: sedangMagang || 0,
      selesaiMagang: selesaiMagang || 0,
      belumAdaPembimbing: belumAdaPembimbing || 0,
    }
  },

  getAllSiswa: async (filters?: { query?: string, status?: string, kelas?: string, jurusan?: string }): Promise<SiswaData[]> => {
    const supabase = await createServerClient()
    let query = supabase
      .from('profiles')
      .select(`
        id,
        nomor_induk,
        full_name,
        kelas,
        jurusan,
        email,
        no_telp,
        status,
        alamat,
        magang!magang_siswa_id_fkey (
          id,
          status,
          guru_id,
          dudi_id,
          guru:guru_id (full_name),
          dudi:dudi_id (nama_perusahaan)
        )
      `)
      .eq('role', 'SISWA')

    if (filters?.query) {
      query = query.or(`full_name.ilike.%${filters.query}%,nomor_induk.ilike.%${filters.query}%`)
    }
    
    if (filters?.status && filters.status !== 'semua') {
      query = query.eq('status', filters.status)
    }

    if (filters?.kelas && filters.kelas !== 'semua') {
      query = query.eq('kelas', filters.kelas)
    }
    
    if (filters?.jurusan && filters.jurusan !== 'semua') {
      query = query.eq('jurusan', filters.jurusan)
    }

    const { data, error } = await query.order('full_name')

    if (error) {
      console.error('Failed to fetch students:', error)
      return []
    }
    if (!data) return []

    return data.map((s) => {
      const magangData = s.magang && Array.isArray(s.magang) ? s.magang[0] : null
      const activeMagang = magangData as unknown as { 
        status: string, 
        guru: { full_name: string }, 
        dudi: { nama_perusahaan: string },
        guru_id: string,
        dudi_id: string
      } | null
      return {
        id: s.id,
        nis: s.nomor_induk || '-',
        nama: s.full_name,
        kelas: s.kelas || '-',
        jurusan: s.jurusan || '-',
        email: s.email,
        nohp: s.no_telp || '-',
        status: s.status || 'aktif',
        statusMagang: activeMagang?.status || 'aktif',
        alamat: (s as { alamat?: string }).alamat || '',
        pembimbing: activeMagang?.guru?.full_name || '-',
        dudi: activeMagang?.dudi?.nama_perusahaan || '-',
        pembimbingId: activeMagang?.guru_id || null,
        dudiId: activeMagang?.dudi_id || null
      }
    })
  },

  createSiswa: async (data: SiswaInput): Promise<{ success: boolean, error?: string }> => {
    try {
      const supabase = await createServerClient()
      const finalPassword = data.password || (data.nis.trim() + '!Simmas123')
      const email = data.email.trim().toLowerCase()
      
      const { data: newUserId, error } = await supabase.rpc('create_siswa_bypassing_auth', {
        p_email: email,
        p_password: finalPassword,
        p_nama: data.nama.trim(),
        p_nis: data.nis.trim(),
        p_nohp: data.nohp.trim(),
        p_kelas: data.kelas,
        p_jurusan: data.jurusan,
        p_alamat: data.alamat || '',
        p_dudi_id: data.dudi_id || null,
        p_guru_id: data.guru_id || null,
        p_status: data.status === 'magang' ? 'aktif' : (data.status || 'menunggu')
      })

      if (error) {
        console.error('Error in createSiswa RPC:', error)
        return { success: false, error: error.message }
      }

      if (newUserId) {
        await logActivity('Create', 'SISWA', newUserId, data)
        return { success: true }
      }
      return { success: false, error: 'Gagal membuat data siswa' }
    } catch (error) {
      console.error('Error in createSiswa:', error)
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, error: message }
    }
  },

  updateSiswa: async (id: string, data: Partial<SiswaInput>): Promise<{ success: boolean, error?: string }> => {
    try {
      const supabase = await createServerClient()
      // 1. Sync to auth and profile via RPC
      const email = data.email ? data.email.trim().toLowerCase() : undefined
      
      // Get current profile data for fields not in data
      const { data: current } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
      
      if (!current) return { success: false, error: 'Siswa tidak ditemukan' }

      const { error: rpcError } = await supabase.rpc('update_user_bypassing_auth', {
        p_user_id: id,
        p_email: email || current.email,
        p_nama: data.nama?.trim() || current.full_name,
        p_role: 'SISWA',
        p_is_verified: true,
        p_password: data.password || null
      })

      if (rpcError) {
        console.error('Error in updateSiswa RPC:', rpcError)
        return { success: false, error: rpcError.message }
      }

      // 2. Update additional profile fields
      const updateProfileData: Record<string, string | null | undefined> = {}
      if (data.nis !== undefined) updateProfileData.nomor_induk = data.nis.trim()
      if (data.nohp !== undefined) updateProfileData.no_telp = data.nohp.trim()
      if (data.kelas !== undefined) updateProfileData.kelas = data.kelas
      if (data.jurusan !== undefined) updateProfileData.jurusan = data.jurusan
      if (data.alamat !== undefined) updateProfileData.alamat = data.alamat
      if (data.status !== undefined) updateProfileData.status = data.status

      if (Object.keys(updateProfileData).length > 0) {
        await supabase.from('profiles').update(updateProfileData).eq('id', id)
      }

      // 3. Update Magang record if status or assignments changed
      const { data: existingMagang } = await supabase
        .from('magang')
        .select('id, status')
        .eq('siswa_id', id)
        .maybeSingle()

      const magangStatusMap: Record<string, string> = {
        'magang': 'aktif',
        'selesai': 'selesai',
        'aktif': 'dibatalkan',
        'non-aktif': 'dibatalkan'
      }

      if (existingMagang) {
        const newMagangStatus = data.status ? magangStatusMap[data.status] : existingMagang.status
        const magangUpdate: Record<string, string | null | undefined> = {}
        if (data.dudi_id !== undefined) magangUpdate.dudi_id = data.dudi_id || null
        if (data.guru_id !== undefined) magangUpdate.guru_id = data.guru_id || null
        if (data.status !== undefined) magangUpdate.status = newMagangStatus

        if (Object.keys(magangUpdate).length > 0) {
          await supabase.from('magang').update(magangUpdate).eq('id', existingMagang.id)
        }
      } else if (data.dudi_id || data.guru_id) {
        await supabase.from('magang').insert({
          siswa_id: id,
          dudi_id: data.dudi_id || null,
          guru_id: data.guru_id || null,
          status: data.status === 'magang' ? 'aktif' : 'menunggu'
        })
      }

      await logActivity('Update', 'SISWA', id, data)
      return { success: true }
    } catch (error) {
      console.error('Error in updateSiswa:', error)
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, error: message }
    }
  },

  deleteSiswa: async (id: string): Promise<{ success: boolean, error?: string }> => {
    try {
      const supabase = await createServerClient()
      const { error } = await supabase.rpc('delete_user_bypassing_auth', {
        p_user_id: id
      })

      if (!error) {
        await logActivity('Delete', 'SISWA', id, { id })
        return { success: true }
      }
      console.error('Error in deleteSiswa RPC:', error)
      return { success: false, error: error.message }
    } catch (error) {
      console.error('Error in deleteSiswa:', error)
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, error: message }
    }
  }
}
