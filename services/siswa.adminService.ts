import { supabase } from '@/lib/supabase'
import { StudentStats, SiswaData, SiswaInput } from '@/types/admin'
import { logActivity } from './activityLogger'

export const siswaAdminService = {
  getStudentStats: async (): Promise<StudentStats> => {
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

  getAllSiswa: async (filters?: { query?: string, status?: string, kelas?: string }): Promise<SiswaData[]> => {
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
        status: activeMagang ? activeMagang.status : 'aktif',
        alamat: (s as { alamat?: string }).alamat || '',
        pembimbing: activeMagang?.guru?.full_name || '-',
        dudi: activeMagang?.dudi?.nama_perusahaan || '-',
        pembimbingId: activeMagang?.guru_id || null,
        dudiId: activeMagang?.dudi_id || null
      }
    })
  },

  createSiswa: async (data: SiswaInput): Promise<boolean> => {
    try {
      // Because Supabase blocks signUp API with "email rate limit exceeded" (3/hour on free tier)
      // We will use an RPC function to bypass auth directly inside the database
      const dummyPassword = data.nis + '!Simmas123'
      
      const { data: newUserId, error } = await supabase.rpc('create_siswa_bypassing_auth', {
        p_email: data.email,
        p_password: dummyPassword,
        p_nama: data.nama,
        p_nis: data.nis,
        p_nohp: data.nohp,
        p_kelas: data.kelas,
        p_jurusan: data.jurusan,
        p_alamat: data.alamat,
        p_dudi_id: data.dudi_id || null,
        p_guru_id: data.guru_id || null,
        p_status: data.status === 'magang' ? 'aktif' : (data.status || 'aktif')
      })

      if (error) {
        console.error('Error creating student via RPC:', error)
        return false
      }

      await logActivity('Create', 'Siswa', newUserId as string, data)
      return true
    } catch (error) {
      console.error('Error in createSiswa:', error)
      return false
    }
  },

  updateSiswa: async (id: string, data: Partial<SiswaInput>): Promise<boolean> => {
    // 1. Update Profile
    const { error: pError } = await supabase
      .from('profiles')
      .update({
        nomor_induk: data.nis,
        full_name: data.nama,
        email: data.email,
        no_telp: data.nohp,
        kelas: data.kelas,
        jurusan: data.jurusan,
        alamat: data.alamat,
        status: data.status === 'magang' ? 'aktif' : (data.status || 'aktif')
      })
      .eq('id', id)

    if (pError) {
      console.error('Error updating profile:', pError)
      return false
    }

    // 2. Update Magang (upsert/update existing)
    if (data.dudi_id !== undefined || data.guru_id !== undefined) {
      // Find existing magang
      const { data: existingMagang } = await supabase
        .from('magang')
        .select('id')
        .eq('siswa_id', id)
        .maybeSingle()

      if (existingMagang) {
        await supabase
          .from('magang')
          .update({
            dudi_id: data.dudi_id || null,
            guru_id: data.guru_id || null,
            status: data.status === 'magang' ? 'aktif' : (data.status === 'selesai' ? 'selesai' : 'menunggu')
          })
          .eq('id', existingMagang.id)
      } else if (data.dudi_id || data.guru_id) {
        await supabase.from('magang').insert({
          siswa_id: id,
          dudi_id: data.dudi_id || null,
          guru_id: data.guru_id || null,
          status: data.status === 'magang' ? 'aktif' : 'menunggu'
        })
      }
    }

    await logActivity('Update', 'Siswa', id, data)
    return true
  },

  deleteSiswa: async (id: string): Promise<boolean> => {
    // Magang and other related data should be deleted by CASCADE or manually
    // Manually delete magang first just in case
    await supabase.from('magang').delete().eq('siswa_id', id)
    
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (!error) {
      await logActivity('Delete', 'Siswa', id, { id })
    }

    return !error
  }
}
