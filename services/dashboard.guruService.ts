/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient as createServerClient } from '@/lib/supabaseServer'
import { GuruDashboardResponse, BimbinganSiswa, GuruJournalApproval, GuruStats } from '@/types/guru'

export const dashboardGuruService = {
  getDashboardData: async (guruId: string): Promise<GuruDashboardResponse> => {
    const supabase = await createServerClient()
    
    // 1. Get Stats (Total, Aktif, Hari Ini, Pending, Rata-rata)
    const { count: totalSiswa } = await supabase
      .from('magang')
      .select('*', { count: 'exact', head: true })
      .eq('guru_id', guruId)

    const { count: siswaMagang } = await supabase
      .from('magang')
      .select('*', { count: 'exact', head: true })
      .eq('guru_id', guruId)
      .eq('status', 'aktif')

    const today = new Date().toISOString().split('T')[0]
    const { count: logbookHariIni } = await supabase
      .from('logbooks')
      .select('*, magang:magang_id!inner(*)', { count: 'exact', head: true })
      .eq('magang.guru_id', guruId)
      .eq('status', 'pending')
      .eq('tanggal', today)

    const { count: pendingLogbooks } = await supabase
      .from('logbooks')
      .select('*, magang:magang_id!inner(*)', { count: 'exact', head: true })
      .eq('magang.guru_id', guruId)
      .eq('status', 'pending')

    const { count: pendingMagang } = await supabase
      .from('magang')
      .select('*', { count: 'exact', head: true })
      .eq('guru_id', guruId)
      .eq('status', 'menunggu')

    const { data: nilaiData } = await supabase
      .from('magang')
      .select('nilai_akhir')
      .eq('guru_id', guruId)
      .not('nilai_akhir', 'is', null)

    const totalNilai = nilaiData?.reduce((acc, curr) => acc + (curr.nilai_akhir || 0), 0) || 0
    const rataRataNilai = nilaiData && nilaiData.length > 0 ? Math.round(totalNilai / nilaiData.length) : 0

    const stats: GuruStats = {
      totalSiswa: totalSiswa || 0,
      siswaMagang: siswaMagang || 0,
      logbookHariIni: logbookHariIni || 0,
      pendingApproval: (pendingLogbooks || 0) + (pendingMagang || 0),
      rataRataNilai: rataRataNilai
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
        nilai_akhir,
        siswa:siswa_id (full_name, nomor_induk, kelas, jurusan),
        dudi:dudi_id (id, nama_perusahaan, alamat)
      `)
      .eq('guru_id', guruId)
      .order('created_at', { ascending: false })
      .limit(5)

    const recentMagang: BimbinganSiswa[] = (recentMagangRaw || []).map((m: any) => {
      const siswa = m.siswa
      const dudi = m.dudi
      
      return {
        id: m.id,
        siswa_id: m.siswa_id,
        siswa: siswa || { full_name: 'Tidak diketahui', nomor_induk: '-', kelas: '-', jurusan: '-' },
        dudi: dudi || { id: '-', nama_perusahaan: 'Tidak diketahui', alamat: '-' },
        tgl_mulai: m.tgl_mulai || '-',
        tgl_selesai: m.tgl_selesai || '-',
        status: m.status || 'menunggu',
        nilai: m.nilai_akhir
      }
    })

    // 3. Recent Logbooks
    const { data: recentLogbooksRaw } = await supabase
      .from('logbooks')
      .select(`
        *,
        magang:magang_id!inner(
          id,
          siswa:siswa_id (full_name, nomor_induk, kelas, jurusan),
          dudi:dudi_id (nama_perusahaan, alamat)
        )
      `)
      .eq('magang.guru_id', guruId)
      .eq('status', 'pending')
      .order('tanggal', { ascending: false })
      .limit(5)

    const recentLogbooks: GuruJournalApproval[] = (recentLogbooksRaw || []).map((l: any) => {
      const magang = l.magang
      const siswa = magang?.siswa
      const dudi = magang?.dudi

      return {
        id: l.id,
        tgl: l.tanggal,
        kegiatan: l.kegiatan,
        kendala: l.kendala,
        status: l.status === 'pending' ? 'menunggu' : l.status,
        foto_url: l.gambar_url,
        siswa: siswa || { full_name: 'Tidak diketahui', nomor_induk: '-', kelas: '-', jurusan: '-' },
        dudi: dudi || { nama_perusahaan: 'Tidak diketahui', alamat: '-' }
      }
    })

    return {
      stats,
      recentMagang,
      recentLogbooks
    }
  }
}
