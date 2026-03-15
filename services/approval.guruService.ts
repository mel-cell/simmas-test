/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient as createServerClient } from '@/lib/supabaseServer'
import { GuruJournalApproval } from '@/types/guru'
import { logActivity } from './activityLogger'

export const approvalGuruService = {
  getJournalsForApproval: async (guruId: string) => {
    const supabase = await createServerClient()
    
    const { data, error } = await supabase
      .from('logbooks')
      .select(`
        *,
        magang:magang_id!inner(
          id,
          guru_id,
          siswa:siswa_id (full_name, nomor_induk, kelas, jurusan),
          dudi:dudi_id (nama_perusahaan, alamat)
        )
      `)
      .eq('magang.guru_id', guruId)
      .order('tanggal', { ascending: false })
    if (error) {
      console.error('Error in getJournalsForApproval:', error)
      return []
    }

    return (data || []).map((l: any): GuruJournalApproval => {
      const magang = l.magang
      const siswa = magang?.siswa
      const dudi = magang?.dudi

      return {
        id: l.id,
        tgl: l.tanggal,
        kegiatan: l.kegiatan,
        kendala: l.kendala,
        status: l.status === 'pending' ? 'menunggu' : (l.status === 'approved' ? 'disetujui' : (l.status === 'rejected' ? 'ditolak' : l.status)),
        foto_url: l.gambar_url,
        catatan_guru: l.catatan_guru,
        siswa: siswa || { full_name: 'Tidak diketahui', nomor_induk: '-', kelas: '-', jurusan: '-' },
        dudi: dudi || { nama_perusahaan: 'Tidak diketahui', alamat: '-' }
      }
    })
  },

  approveJournal: async (id: string, status: 'disetujui' | 'ditolak', notes?: string) => {
    const supabase = await createServerClient()
    
    const dbStatus = status === 'disetujui' ? 'approved' : 'rejected'

    const { error } = await supabase
      .from('logbooks')
      .update({
        status: dbStatus,
        catatan_guru: notes || null
      })
      .eq('id', id)

    if (!error) {
      await logActivity('Approval', 'LOGBOOK', id, { status, notes })
    }

    return !error
  },

  getPendingInternships: async (guruId: string) => {
    const supabase = await createServerClient()
    
    const { data, error } = await supabase
      .from('magang')
      .select(`
        id,
        siswa_id,
        tgl_mulai,
        tgl_selesai,
        status,
        siswa:siswa_id (full_name, nomor_induk, kelas, jurusan),
        dudi:dudi_id (id, nama_perusahaan, alamat)
      `)
      .eq('guru_id', guruId)
      .eq('status', 'menunggu')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error in getPendingInternships:', error)
      return []
    }

    return (data || []).map((m: any) => {
      const siswa = Array.isArray(m.siswa) ? m.siswa[0] : m.siswa
      const dudi = Array.isArray(m.dudi) ? m.dudi[0] : m.dudi

      return {
        id: m.id,
        siswa_id: m.siswa_id,
        siswa: siswa || { full_name: 'Tidak diketahui', nomor_induk: '-', kelas: '-', jurusan: '-' },
        dudi: dudi || { id: '-', nama_perusahaan: 'Tidak diketahui', alamat: '-' },
        tgl_mulai: m.tgl_mulai || '-',
        tgl_selesai: m.tgl_selesai || '-',
        status: m.status || 'menunggu'
      }
    })
  }
}
