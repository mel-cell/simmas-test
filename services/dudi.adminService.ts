import { supabase } from '@/lib/supabase'
import { DudiStats, ActiveDudi, DudiInput } from '@/types/admin'
import { logActivity } from './activityLogger'

export const dudiAdminService = {
  getDudiStats: async (): Promise<DudiStats> => {
    // 1. Total DUDI
    const { count: total } = await supabase
      .from('dudi')
      .select('*', { count: 'exact', head: true })

    // 2. DUDI Aktif
    const { count: aktif } = await supabase
      .from('dudi')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // 3. DUDI Tidak Aktif
    const tidakAktif = (total || 0) - (aktif || 0)

    // 4. Total Siswa Magang (count all active students in magang)
    const { count: totalSiswaMagang } = await supabase
      .from('magang')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'aktif')

    return {
      total: total || 0,
      aktif: aktif || 0,
      tidakAktif,
      totalSiswaMagang: totalSiswaMagang || 0
    }
  },

  getAllDudi: async (filters?: { query?: string, status?: string }): Promise<ActiveDudi[]> => {
    let query = supabase
      .from('dudi')
      .select(`
        id,
        nama_perusahaan,
        alamat,
        email,
        no_telp,
        penanggung_jawab,
        is_active,
        magang_count:magang(count)
      `)

    if (filters?.query) {
      query = query.or(`nama_perusahaan.ilike.%${filters.query}%,penanggung_jawab.ilike.%${filters.query}%`)
    }

    if (filters?.status && filters.status !== 'semua') {
      const isAktif = filters.status === 'aktif'
      query = query.eq('is_active', isAktif)
    }

    const { data, error } = await query.order('nama_perusahaan')

    if (error) {
      console.error('Failed to fetch dudi:', error)
      return []
    }
    if (!data) return []

    return data.map((d: {
      id: string;
      nama_perusahaan: string;
      alamat: string;
      email: string | null;
      no_telp: string | null;
      penanggung_jawab: string;
      is_active: boolean;
      magang_count: { count: number }[];
    }) => ({
      id: d.id,
      namaPerusahaan: d.nama_perusahaan,
      alamat: d.alamat,
      email: d.email || '-',
      noTelp: d.no_telp || '-',
      penanggungJawab: d.penanggung_jawab,
      jumlahSiswa: d.magang_count && d.magang_count.length > 0 ? d.magang_count[0].count : 0,
      status: d.is_active
    }))
  },

  createDudi: async (data: DudiInput): Promise<boolean> => {
    try {
      const { data: newDudi, error } = await supabase
        .from('dudi')
        .insert({
          nama_perusahaan: data.namaPerusahaan,
          alamat: data.alamat,
          penanggung_jawab: data.penanggungJawab,
          email: data.email,
          no_telp: data.noTelp,
          is_active: data.status
        })
        .select('id')
        .single()

      if (error) {
        console.error('Error creating DUDI:', error)
        return false
      }

      await logActivity('Create', 'DUDI', newDudi?.id, data)
      return true
    } catch (error) {
      console.error('Error in createDudi:', error)
      return false
    }
  },

  updateDudi: async (id: string, data: Partial<DudiInput>): Promise<boolean> => {
    try {
      const updateData: Record<string, unknown> = {}
      if (data.namaPerusahaan !== undefined) updateData.nama_perusahaan = data.namaPerusahaan
      if (data.alamat !== undefined) updateData.alamat = data.alamat
      if (data.penanggungJawab !== undefined) updateData.penanggung_jawab = data.penanggungJawab
      if (data.email !== undefined) updateData.email = data.email
      if (data.noTelp !== undefined) updateData.no_telp = data.noTelp
      if (data.status !== undefined) updateData.is_active = data.status

      const { error } = await supabase
        .from('dudi')
        .update(updateData)
        .eq('id', id)

      if (error) {
        console.error('Error updating DUDI:', error)
        return false
      }
      
      await logActivity('Update', 'DUDI', id, updateData)
      return true
    } catch (error) {
      console.error('Error in updateDudi:', error)
      return false
    }
  },

  deleteDudi: async (id: string): Promise<boolean> => {
    try {
      // the foreign key might be ON DELETE CASCADE for magang or we might need to handle it.
      // Looking at the SQL, it's ON DELETE CASCADE for dudi_id in magang.
      // So deleting DUDI will delete the magang records associated with it. Careful!
      // But typically we should just delete the dudi. 

      const { error } = await supabase
        .from('dudi')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting DUDI:', error)
        return false
      }
      
      await logActivity('Delete', 'DUDI', id, { id })
      return true
    } catch(error) {
      console.error('Error in deleteDudi:', error)
      return false
    }
  }
}
