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
    // Make sure dudi_id is present
    if (!data.dudi_id) return false;

    // Optional guru
    const guru_id = data.guru_id === '' ? null : data.guru_id;

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

    const { error } = await supabase
      .from('magang')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Error updating magang:', error)
      return false
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
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, magang!magang_siswa_id_fkey(id)')
      .eq('role', 'SISWA')
      .order('full_name')

    if (error) return []

    // Map to simple array
    // Optionally we can only return students without active magang, 
    // but the user might want to assign them anyway and overwrite or we can just list all
    return data.map((d: { id: string, full_name: string }) => ({
      id: d.id,
      nama: d.full_name
    }))
  }
}
