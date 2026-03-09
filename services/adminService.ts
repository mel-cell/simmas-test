import { supabase } from '@/lib/supabase'
import { AdminStats, RecentMagang, RecentLogbook, ActiveDudi, StudentStats, SiswaData, TeacherStats, GuruData, DudiStats } from '@/types/admin'

export const adminService = {
  getDashboardStats: async (): Promise<AdminStats> => {
    const { count: totalSiswa } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'SISWA')
      
    const { count: totalDudi } = await supabase
      .from('dudi')
      .select('*', { count: 'exact', head: true })
      
    const { count: siswaMagang } = await supabase
      .from('magang')
      .select('*', { count: 'exact', head: true })
      .in('status', ['aktif', 'berjalan', 'menunggu']) // Adjust to real status you need
      
    const today = new Date().toISOString().split('T')[0]
    const { count: logbookHariIni } = await supabase
      .from('logbooks')
      .select('*', { count: 'exact', head: true })
      .eq('tanggal', today)

    return {
      totalSiswa: totalSiswa || 0,
      totalDudi: totalDudi || 0,
      siswaMagang: siswaMagang || 0,
      logbookHariIni: logbookHariIni || 0,
    }
  },

  getRecentMagang: async (): Promise<RecentMagang[]> => {
    const { data, error } = await supabase
      .from('magang')
      .select(`
        id, 
        tgl_mulai, 
        tgl_selesai, 
        status,
        profiles(full_name),
        dudi(nama_perusahaan)
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error || !data) return []

    return data.map((item: { 
      id: string; 
      tgl_mulai: string; 
      tgl_selesai: string; 
      status: string; 
      profiles: { full_name: string } | { full_name: string }[] | null; 
      dudi: { nama_perusahaan: string } | { nama_perusahaan: string }[] | null;
    }) => ({
      id: item.id,
      namaSiswa: Array.isArray(item.profiles) 
        ? item.profiles[0]?.full_name || 'Tidak diketahui'
        : item.profiles?.full_name || 'Tidak diketahui',
      dudi: Array.isArray(item.dudi) 
        ? item.dudi[0]?.nama_perusahaan || 'Tidak diketahui'
        : item.dudi?.nama_perusahaan || 'Tidak diketahui',
      startDate: item.tgl_mulai,
      endDate: item.tgl_selesai,
      status: item.status === 'aktif' ? 'Aktif' : 'Menunggu',
    }))
  },

  getRecentLogbooks: async (): Promise<RecentLogbook[]> => {
    const { data, error } = await supabase
      .from('logbooks')
      .select('id, kegiatan, tanggal, kendala, status')
      .order('created_at', { ascending: false })
      .limit(3)
      
    if (error || !data) return []
    
    return data.map((item: {
      id: string;
      kegiatan: string;
      tanggal: string;
      kendala: string | null;
      status: string;
    }) => ({
      id: item.id,
      kegiatan: item.kegiatan,
      tanggal: item.tanggal,
      kendala: item.kendala,
      status: item.status === 'pending' ? 'pending' : item.status === 'Disetujui' ? 'Disetujui' : item.status === 'approved' ? 'Disetujui' : 'Ditolak',
    }))
  },

  getActiveDudi: async (): Promise<ActiveDudi[]> => {
    const { data, error } = await supabase
      .from('dudi')
      .select(`
        id, 
        nama_perusahaan, 
        alamat, 
        email,
        no_telp,
        penanggung_jawab,
        is_active,
        magang(count)
      `)
      .eq('is_active', true)
      .limit(4)
      
    if (error || !data) return []
    
    return data.map((item: {
      id: string;
      nama_perusahaan: string;
      alamat: string;
      email: string | null;
      no_telp: string | null;
      penanggung_jawab: string | null;
      magang: { count: number }[];
      is_active: boolean;
    }) => ({
      id: item.id,
      namaPerusahaan: item.nama_perusahaan,
      alamat: item.alamat,
      email: item.email || '-',
      noTelp: item.no_telp || '-',
      penanggungJawab: item.penanggung_jawab || '-',
      jumlahSiswa: item.magang[0]?.count || 0,
      status: item.is_active
    }))
  },

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
        magang (
          id,
          status,
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

    if (error || !data) return []

    return data.map((s) => {
      const magangData = s.magang && Array.isArray(s.magang) ? s.magang[0] : null
      const activeMagang = magangData as unknown as { 
        status: string, 
        guru: { full_name: string }, 
        dudi: { nama_perusahaan: string } 
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
        pembimbing: activeMagang?.guru?.full_name || '-',
        dudi: activeMagang?.dudi?.nama_perusahaan || '-'
      }
    })
  },

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
        magang_count:magang(count)
      `)
      .eq('role', 'GURU')

    if (filters?.query) {
      query = query.or(`full_name.ilike.%${filters.query}%,nomor_induk.ilike.%${filters.query}%`)
    }

    if (filters?.status && filters.status !== 'semua') {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query.order('full_name')

    if (error || !data) return []

    return data.map((g: {
      id: string;
      nomor_induk: string | null;
      full_name: string;
      jurusan: string | null;
      email: string;
      no_telp: string | null;
      status: string | null;
      magang_count: { count: number }[];
    }) => ({
      id: g.id,
      nip: g.nomor_induk || '-',
      nama: g.full_name,
      mataPelajaran: g.jurusan || 'Tidak Diatur', // Assuming jurusan as mata pelajaran for guru in profiles
      email: g.email,
      nohp: g.no_telp || '-',
      totalSiswa: g.magang_count && g.magang_count.length > 0 ? g.magang_count[0].count : 0,
      status: g.status || 'aktif'
    }))
  },

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
      const isActive = filters.status === 'aktif'
      query = query.eq('is_active', isActive)
    }

    const { data, error } = await query.order('nama_perusahaan')

    if (error || !data) return []

    return data.map((d: {
      id: string;
      nama_perusahaan: string;
      alamat: string;
      email: string | null;
      no_telp: string | null;
      penanggung_jawab: string | null;
      is_active: boolean;
      magang_count: { count: number }[];
    }) => ({
      id: d.id,
      namaPerusahaan: d.nama_perusahaan,
      alamat: d.alamat,
      email: d.email || '-',
      noTelp: d.no_telp || '-',
      penanggungJawab: d.penanggung_jawab || '-',
      jumlahSiswa: d.magang_count && d.magang_count.length > 0 ? d.magang_count[0].count : 0,
      status: d.is_active
    }))
  }
}
