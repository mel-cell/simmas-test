import { supabase } from '@/lib/supabase'
import { InternshipStats, RecentMagang, MagangInput } from '@/types/admin'
import { logActivity } from './activityLogger'

export const magangAdminService = {
  getInternshipStats: async (): Promise<InternshipStats> => {
    // 1. Total Magang
    const { count: total } = await supabase
      .from('magang')
      .select('*', { count: 'exact', head: true })

    // 2. Sedang Aktif
    const { count: aktif } = await supabase
      .from('magang')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'aktif')

    // 3. Selesai
    const { count: selesai } = await supabase
      .from('magang')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'selesai')

    // 4. Dibatalkan
    const { count: dibatalkan } = await supabase
      .from('magang')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'dibatalkan')

    return {
      total: total || 0,
      aktif: aktif || 0,
      selesai: selesai || 0,
      dibatalkan: dibatalkan || 0
    }
  },

  getAllMagang: async (filters?: { query?: string, status?: string }): Promise<RecentMagang[]> => {
    let query = supabase
      .from('magang')
      .select(`
        id,
        status,
        tgl_mulai,
        tgl_selesai,
        siswa_id,
        guru_id,
        dudi_id,
        siswa:siswa_id (full_name),
        guru:guru_id (full_name),
        dudi:dudi_id (nama_perusahaan)
      `)

    if (filters?.status && filters.status !== 'semua') {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error || !data) return []

    // Filter results locally if there is a query string (for joined fields)
    let results: RecentMagang[] = data.map((m: {
      id: string;
      status: string | null;
      tgl_mulai: string | null;
      tgl_selesai: string | null;
      siswa_id: string;
      guru_id: string | null;
      dudi_id: string;
      siswa: { full_name: string }[] | { full_name: string } | null;
      guru: { full_name: string }[] | { full_name: string } | null;
      dudi: { nama_perusahaan: string }[] | { nama_perusahaan: string } | null;
    }) => {
      const siswa = Array.isArray(m.siswa) ? m.siswa[0] : m.siswa;
      const guru = Array.isArray(m.guru) ? m.guru[0] : m.guru;
      const dudi = Array.isArray(m.dudi) ? m.dudi[0] : m.dudi;

      return {
        id: m.id,
        siswa_id: m.siswa_id,
        guru_id: m.guru_id,
        dudi_id: m.dudi_id,
        namaSiswa: siswa?.full_name || 'Tidak diketahui',
        dudi: dudi?.nama_perusahaan || 'Tidak diketahui',
        pembimbing: guru?.full_name || 'Belum ditugaskan',
        startDate: m.tgl_mulai || '-',
        endDate: m.tgl_selesai || '-',
        status: m.status || 'menunggu'
      };
    })

    if (filters?.query) {
      const lowercaseQuery = filters.query.toLowerCase();
      results = results.filter((magang) => 
        magang.namaSiswa.toLowerCase().includes(lowercaseQuery) ||
        magang.dudi.toLowerCase().includes(lowercaseQuery) ||
        magang.pembimbing.toLowerCase().includes(lowercaseQuery)
      )
    }

    return results
  },

  createMagang: async (data: MagangInput): Promise<boolean> => {
    // 1. Validasi Input
    if (!data.dudi_id || !data.siswa_id) return false;

    // 2. Cegah Double Plot (Constraint logic)
    // Cek apakah siswa sudah punya magang yang statusnya 'aktif' atau 'menunggu'
    const { data: existing } = await supabase
      .from('magang')
      .select('id')
      .eq('siswa_id', data.siswa_id)
      .in('status', ['aktif', 'menunggu'])
      .maybeSingle()

    if (existing) {
      console.error('Siswa sudah terdaftar di penempatan lain yang sedang aktif/menunggu.')
      return false
    }

    // Optional guru
    const guru_id = data.guru_id === '' ? null : data.guru_id;

    // 3. Insert Penempatan Baru
    const { data: newMagang, error } = await supabase
      .from('magang')
      .insert({
        siswa_id: data.siswa_id,
        guru_id: guru_id,
        dudi_id: data.dudi_id,
        tgl_mulai: data.tgl_mulai,
        tgl_selesai: data.tgl_selesai,
        status: data.status || 'menunggu'
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating magang:', error)
      return false
    }

    // 4. Sinkronisasi Status Profil Siswa
    // Jika status magang diset 'aktif', ubah status di profile siswa menjadi 'magang'
    if (data.status === 'aktif') {
      await supabase.from('profiles').update({ status: 'magang' }).eq('id', data.siswa_id)
    }

    await logActivity('Create', 'MAGANG', newMagang?.id, data)
    return true
  },

  updateMagang: async (id: string, data: Partial<MagangInput>): Promise<boolean> => {
    const updateData: Record<string, unknown> = {}
    if (data.siswa_id !== undefined) updateData.siswa_id = data.siswa_id
    if (data.guru_id !== undefined) updateData.guru_id = data.guru_id === '' ? null : data.guru_id
    if (data.dudi_id !== undefined) updateData.dudi_id = data.dudi_id
    if (data.tgl_mulai !== undefined) updateData.tgl_mulai = data.tgl_mulai
    if (data.tgl_selesai !== undefined) updateData.tgl_selesai = data.tgl_selesai
    if (data.status !== undefined) updateData.status = data.status

    // 1. Get current magang to know who the student is (if not provided in data)
    let siswaId = data.siswa_id
    if (!siswaId) {
      const { data: current } = await supabase.from('magang').select('siswa_id').eq('id', id).single()
      if (current) siswaId = current.siswa_id
    }

    // 2. Perform Update
    const { error } = await supabase
      .from('magang')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Error updating magang:', error)
      return false
    }

    // 3. Sinkronisasi Status Profil Siswa
    if (siswaId && data.status) {
      if (data.status === 'aktif') {
        await supabase.from('profiles').update({ status: 'magang' }).eq('id', siswaId)
      } else if (data.status === 'selesai') {
        await supabase.from('profiles').update({ status: 'selesai' }).eq('id', siswaId)
      } else if (data.status === 'dibatalkan' || data.status === 'menunggu') {
        // Jika dibatalkan atau kembali menunggu, status profile dikembalikan ke 'aktif' (Belum Magang)
        await supabase.from('profiles').update({ status: 'aktif' }).eq('id', siswaId)
      }
    }
    
    await logActivity('Update', 'MAGANG', id, updateData)
    return true
  },

  deleteMagang: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('magang')
      .delete()
      .eq('id', id)
      
    if (error) {
      console.error('Error deleting magang:', error)
      return false
    }
    
    await logActivity('Delete', 'MAGANG', id, { id })
    return true
  },
  
  // fetch options for dropdowns
  getSiswaOptions: async () => {
    // Hanya ambil siswa yang status profilenya 'aktif' (artinya belum magang atau magang sebelumnya sudah selesai/dibatalkan)
    // DAN tidak sedang memiliki record magang dengan status 'aktif' atau 'menunggu'
    const { data: allSiswa, error } = await supabase
      .from('profiles')
      .select(`
        id, 
        full_name, 
        magang!magang_siswa_id_fkey(status)
      `)
      .eq('role', 'SISWA')
      .eq('status', 'aktif') // Status 'aktif' di profiles berarti siap ditempatkan
      .order('full_name')

    if (error) return []

    // Filter tambahan di client-side untuk memastikan tidak ada record magang yang 'aktif'/'menunggu'
    // (Meskipun status profile 'aktif' harusnya sudah sinkron, ini untuk keamanan extra)
    const filtered = (allSiswa as unknown as { id: string, full_name: string, magang: { status: string }[] | { status: string } | null }[]).filter((s) => {
      const magang = Array.isArray(s.magang) ? s.magang : (s.magang ? [s.magang] : [])
      const activeInternships = magang.filter(m => 
        ['aktif', 'menunggu'].includes(m.status)
      )
      return activeInternships.length === 0
    })

    return filtered.map((d) => ({
      id: d.id,
      nama: d.full_name
    }))
  }
}
