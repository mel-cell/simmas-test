/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient as createServerClient } from '@/lib/supabaseServer'
import { InternshipStats, RecentMagang, MagangInput } from '@/types/admin'
import { logActivity } from './activityLogger'

export const magangAdminService = {
  getInternshipStats: async (): Promise<InternshipStats> => {
    const supabase = await createServerClient()
    
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
    const supabase = await createServerClient()
    
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

    let results: RecentMagang[] = data.map((m: any) => {
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

  createMagang: async (data: MagangInput): Promise<{ success: boolean, error?: string }> => {
    const supabase = await createServerClient()
    
    // 1. Validasi Input
    if (!data.dudi_id || !data.siswa_id) return { success: false, error: 'Data Siswa dan DUDI wajib diisi' };

    // 2. Cegah Double Plot (Constraint logic)
    const { data: existing } = await supabase
      .from('magang')
      .select('id')
      .eq('siswa_id', data.siswa_id)
      .in('status', ['aktif', 'menunggu'])
      .maybeSingle()

    if (existing) {
      return { success: false, error: 'Siswa sudah terdaftar di penempatan lain yang sedang aktif atau menunggu.' }
    }

    // 3. Cek Kuota DUDI
    const { data: dudi } = await supabase
      .from('dudi')
      .select('kuota_maksimal')
      .eq('id', data.dudi_id)
      .maybeSingle()

    if (dudi && dudi.kuota_maksimal && data.status === 'aktif') {
      const { count: acceptedSiswa } = await supabase
        .from('magang')
        .select('*', { count: 'exact', head: true })
        .eq('dudi_id', data.dudi_id)
        .eq('status', 'aktif')

      if (acceptedSiswa !== null && acceptedSiswa >= dudi.kuota_maksimal) {
        return { success: false, error: 'Pembuatan gagal. Kuota penempatan magang aktif di DUDI ini sudah penuh.' }
      }
    }

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
      return { success: false, error: error.message }
    }

    // 4. Sinkronisasi Status Profil Siswa
    if (data.status === 'aktif') {
      await supabase.from('profiles').update({ status: 'magang' }).eq('id', data.siswa_id)
    }

    await logActivity('Create', 'MAGANG', newMagang?.id, data)
    return { success: true }
  },

  updateMagang: async (id: string, data: Partial<MagangInput>): Promise<{ success: boolean, error?: string }> => {
    const supabase = await createServerClient()
    
    const updateData: Record<string, unknown> = {}
    if (data.siswa_id !== undefined) updateData.siswa_id = data.siswa_id
    if (data.guru_id !== undefined) updateData.guru_id = data.guru_id === '' ? null : data.guru_id
    if (data.dudi_id !== undefined) updateData.dudi_id = data.dudi_id
    if (data.tgl_mulai !== undefined) updateData.tgl_mulai = data.tgl_mulai
    if (data.tgl_selesai !== undefined) updateData.tgl_selesai = data.tgl_selesai
    if (data.status !== undefined) updateData.status = data.status

    // 1. Get current magang to know who the student is and current status/dudi
    let siswaId = data.siswa_id
    let currentDudiId = data.dudi_id
    let currentStatus
    
    const { data: current } = await supabase.from('magang').select('siswa_id, dudi_id, status').eq('id', id).single()
    if (current) {
      if (!siswaId) siswaId = current.siswa_id
      if (currentDudiId === undefined) currentDudiId = current.dudi_id
      currentStatus = current.status
    }

    // 2. Cek Kuota DUDI jika mengubah ke status aktif (atau mengganti DUDI tapi tetap aktif)
    const targetStatus = data.status || currentStatus
    if (currentDudiId && targetStatus === 'aktif' && (currentStatus !== 'aktif' || data.dudi_id)) {
      // Cek Double Plot untuk Siswa (Apakah punya 'aktif' / 'menunggu' lain selain ID ini?)
      const { data: existingSiswaMagang } = await supabase
        .from('magang')
        .select('id')
        .eq('siswa_id', siswaId)
        .in('status', ['aktif', 'menunggu'])
        .neq('id', id)
        .maybeSingle()
      
      if (existingSiswaMagang) {
        return { success: false, error: 'Update dibatalkan. Siswa bersangkutan sudah memiliki status magang aktif/menunggu di tempat lain.' }
      }

      // Cek Kuota DUDI
      const { data: dudi } = await supabase
        .from('dudi')
        .select('kuota_maksimal')
        .eq('id', currentDudiId)
        .maybeSingle()

      if (dudi && dudi.kuota_maksimal) {
        let acceptedSiswaQuery = supabase
          .from('magang')
          .select('*', { count: 'exact', head: true })
          .eq('dudi_id', currentDudiId)
          .eq('status', 'aktif')
          
        if (currentStatus === 'aktif' && !data.dudi_id) {
           // If they were already active at the SAME dudi, we exclude them from recount
           acceptedSiswaQuery = acceptedSiswaQuery.neq('id', id)
        }

        const { count: acceptedSiswa } = await acceptedSiswaQuery

        if (acceptedSiswa !== null && acceptedSiswa >= dudi.kuota_maksimal) {
          return { success: false, error: 'Update dibatalkan. Kuota penempatan magang aktif di DUDI ini sudah penuh.' }
        }
      }
    }

    // 3. Perform Update
    const { error } = await supabase
      .from('magang')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Error updating magang:', error)
      return { success: false, error: error.message }
    }

    // 3. Sinkronisasi Status Profil Siswa
    if (siswaId && data.status) {
      if (data.status === 'aktif') {
        await supabase.from('profiles').update({ status: 'magang' }).eq('id', siswaId)
      } else if (data.status === 'selesai') {
        await supabase.from('profiles').update({ status: 'selesai' }).eq('id', siswaId)
      } else if (data.status === 'dibatalkan' || data.status === 'menunggu') {
        await supabase.from('profiles').update({ status: 'aktif' }).eq('id', siswaId)
      }
    }
    
    await logActivity('Update', 'MAGANG', id, updateData)
    return { success: true }
  },

  deleteMagang: async (id: string): Promise<{ success: boolean, error?: string }> => {
    try {
      const supabase = await createServerClient()
      const { error } = await supabase
        .from('magang')
        .delete()
        .eq('id', id)
        
      if (error) {
        console.error('Error deleting magang:', error)
        return { success: false, error: error.message }
      }
      
      await logActivity('Delete', 'MAGANG', id, { id })
      return { success: true }
    } catch (error) {
      console.error('Error in deleteMagang:', error)
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, error: message }
    }
  },
  
  getSiswaOptions: async () => {
    const supabase = await createServerClient()
    const { data: allSiswa, error } = await supabase
      .from('profiles')
      .select(`
        id, 
        full_name, 
        magang!magang_siswa_id_fkey(status)
      `)
      .eq('role', 'SISWA')
      .eq('status', 'aktif') 
      .order('full_name')

    if (error) return []

    const filtered = (allSiswa as any[]).filter((s) => {
      const magang = Array.isArray(s.magang) ? s.magang : (s.magang ? [s.magang] : [])
      const activeInternships = magang.filter((m: any) => 
        ['aktif', 'menunggu'].includes(m.status)
      )
      return activeInternships.length === 0
    })

    return filtered.map((d: any) => ({
      id: d.id,
      nama: d.full_name
    }))
  }
}
