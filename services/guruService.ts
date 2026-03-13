/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient as createServerClient } from '@/lib/supabaseServer'
import { GuruDashboardResponse, BimbinganSiswa, GuruJournalApproval, GuruStats } from '@/types/guru'
import { logActivity } from './activityLogger'

export const guruService = {
  getDashboardData: async (guruId: string): Promise<GuruDashboardResponse> => {
    const supabase = await createServerClient()
    
    // 1. Get Stats
    // Total Siswa bimbingan
    const { count: totalSiswa } = await supabase
      .from('magang')
      .select('*', { count: 'exact', head: true })
      .eq('guru_id', guruId)

    // Siswa Magang Aktif
    const { count: siswaMagang } = await supabase
      .from('magang')
      .select('*', { count: 'exact', head: true })
      .eq('guru_id', guruId)
      .eq('status', 'aktif')

    // Logbook hari ini yang pending
    const today = new Date().toISOString().split('T')[0]
    const { count: logbookHariIni } = await supabase
      .from('logbooks')
      .select('*, magang!inner(*)', { count: 'exact', head: true })
      .eq('magang.guru_id', guruId)
      .eq('status', 'pending')
      .eq('tanggal', today)

    const stats: GuruStats = {
      totalSiswa: totalSiswa || 0,
      siswaMagang: siswaMagang || 0,
      logbookHariIni: logbookHariIni || 0
    }

    // 2. Recent Magang
    const { data: recentMagangRaw } = await supabase
      .from('magang')
      .select(`
        id,
        siswa_id,
        tgl_mulai,
        tgl_selesai,
        status,
        nilai_prakerin,
        catatan,
        profiles:siswa_id (full_name, nomor_induk, kelas, jurusan),
        dudi:dudi_id (id, nama_perusahaan, alamat)
      `)
      .eq('guru_id', guruId)
      .order('created_at', { ascending: false })
      .limit(5)

    const recentMagang: BimbinganSiswa[] = (recentMagangRaw || []).map((m: any) => ({
      id: m.id,
      siswa_id: m.siswa_id,
      siswa: m.profiles,
      dudi: m.dudi,
      tgl_mulai: m.tgl_mulai,
      tgl_selesai: m.tgl_selesai,
      status: m.status,
      nilai: m.nilai_prakerin,
      catatan: m.catatan
    }))

    // 3. Recent Logbooks (Approval needed)
    const { data: recentLogbooksRaw } = await supabase
      .from('logbooks')
      .select(`
        *,
        magang!inner(
          id,
          profiles:siswa_id (full_name, nomor_induk, kelas, jurusan),
          dudi:dudi_id (nama_perusahaan, alamat)
        )
      `)
      .eq('magang.guru_id', guruId)
      .eq('status', 'pending')
      .order('tanggal', { ascending: false })
      .limit(5)

    const recentLogbooks: GuruJournalApproval[] = (recentLogbooksRaw || []).map((l: any) => ({
      id: l.id,
      tgl: l.tanggal,
      kegiatan: l.kegiatan,
      kendala: l.kendala,
      status: l.status === 'pending' ? 'menunggu' : l.status,
      foto_url: l.gambar_url,
      siswa: l.magang.profiles,
      dudi: l.magang.dudi
    }))

    return {
      stats,
      recentMagang,
      recentLogbooks
    }
  },

  getBimbinganSiswa: async (guruId: string, filters?: { status?: string, query?: string }) => {
    const supabase = await createServerClient()
    
    let query = supabase
      .from('magang')
      .select(`
        id,
        siswa_id,
        tgl_mulai,
        tgl_selesai,
        status,
        nilai_prakerin,
        catatan,
        profiles:siswa_id (full_name, nomor_induk, kelas, jurusan),
        dudi:dudi_id (id, nama_perusahaan, alamat)
      `)
      .eq('guru_id', guruId)

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) return []

    let results: BimbinganSiswa[] = (data || []).map((m: any) => ({
      id: m.id,
      siswa_id: m.siswa_id,
      siswa: m.profiles,
      dudi: m.dudi,
      tgl_mulai: m.tgl_mulai,
      tgl_selesai: m.tgl_selesai,
      status: m.status,
      nilai: m.nilai_prakerin,
      catatan: m.catatan
    }))

    if (filters?.query) {
      const q = filters.query.toLowerCase()
      results = results.filter(r => 
        r.siswa.full_name.toLowerCase().includes(q) || 
        r.dudi.nama_perusahaan.toLowerCase().includes(q)
      )
    }

    return results
  },

  updateMagangStatus: async (id: string, data: { status: string, tgl_mulai?: string, tgl_selesai?: string, catatan?: string }) => {
    const supabase = await createServerClient()
    
    const { error } = await supabase
      .from('magang')
      .update({
        status: data.status,
        tgl_mulai: data.tgl_mulai,
        tgl_selesai: data.tgl_selesai,
        catatan: data.catatan
      })
      .eq('id', id)

    if (!error) {
      await logActivity('Update Status', 'MAGANG', id, data)
    }

    return !error
  },

  inputNilai: async (id: string, nilai: number) => {
    const supabase = await createServerClient()
    
    const { error } = await supabase
      .from('magang')
      .update({
        nilai_prakerin: nilai
      })
      .eq('id', id)

    if (!error) {
      await logActivity('Input Nilai', 'MAGANG', id, { nilai })
    }

    return !error
  },

  getJournalsForApproval: async (guruId: string) => {
    const supabase = await createServerClient()
    
    const { data, error } = await supabase
      .from('logbooks')
      .select(`
        *,
        magang!inner(
          id,
          profiles:siswa_id (full_name, nomor_induk, kelas, jurusan),
          dudi:dudi_id (nama_perusahaan, alamat)
        )
      `)
      .eq('magang.guru_id', guruId)
      .order('tanggal', { ascending: false })

    if (error) return []

    return (data || []).map((l: any): GuruJournalApproval => ({
      id: l.id,
      tgl: l.tanggal,
      kegiatan: l.kegiatan,
      kendala: l.kendala,
      status: l.status === 'pending' ? 'menunggu' : (l.status === 'approved' ? 'disetujui' : (l.status === 'rejected' ? 'ditolak' : l.status)),
      foto_url: l.gambar_url,
      catatan_guru: l.catatan_guru,
      siswa: l.magang.profiles,
      dudi: l.magang.dudi
    }))
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
  }
}
