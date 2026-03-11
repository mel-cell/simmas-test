import { supabase } from '@/lib/supabase'
import { createBrowserClient } from '@supabase/ssr'
import { AdminStats, RecentMagang, RecentLogbook, ActiveDudi, TeacherStats, GuruData, DudiStats, InternshipStats, UserProfileData, ActivityLog, ActivityStats, SchoolSettings } from '@/types/admin'

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
        siswa:siswa_id(full_name),
        guru:guru_id(full_name),
        dudi:dudi_id(nama_perusahaan)
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error || !data) return []

    return data.map((item: {
      id: string;
      tgl_mulai: string | null;
      tgl_selesai: string | null;
      status: string | null;
      siswa: { full_name: string }[] | { full_name: string } | null;
      guru: { full_name: string }[] | { full_name: string } | null;
      dudi: { nama_perusahaan: string }[] | { nama_perusahaan: string } | null;
    }) => {
      const siswa = Array.isArray(item.siswa) ? item.siswa[0] : item.siswa;
      const guru = Array.isArray(item.guru) ? item.guru[0] : item.guru;
      const dudi = Array.isArray(item.dudi) ? item.dudi[0] : item.dudi;
      
      return {
        id: item.id,
        namaSiswa: siswa?.full_name || 'Tidak diketahui',
        dudi: dudi?.nama_perusahaan || 'Tidak diketahui',
        pembimbing: guru?.full_name || 'Belum ditugaskan',
        startDate: item.tgl_mulai || '-',
        endDate: item.tgl_selesai || '-',
        status: item.status || 'menunggu',
      };
    })
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
        magang_count:magang!magang_guru_id_fkey(count)
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
  },

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
      siswa: { full_name: string }[] | { full_name: string } | null;
      guru: { full_name: string }[] | { full_name: string } | null;
      dudi: { nama_perusahaan: string }[] | { nama_perusahaan: string } | null;
    }) => {
      const siswa = Array.isArray(m.siswa) ? m.siswa[0] : m.siswa;
      const guru = Array.isArray(m.guru) ? m.guru[0] : m.guru;
      const dudi = Array.isArray(m.dudi) ? m.dudi[0] : m.dudi;

      return {
        id: m.id,
        namaSiswa: siswa?.full_name || 'Tidak diketahui',
        dudi: dudi?.nama_perusahaan || 'Tidak diketahui',
        pembimbing: guru?.full_name || 'Belum ditugaskan',
        startDate: m.tgl_mulai || '-',
        endDate: m.tgl_selesai || '-',
        status: m.status || 'menunggu'
      };
    })

    if (filters?.query) {
      const q = filters.query.toLowerCase()
      results = results.filter((r: RecentMagang) => 
        r.namaSiswa.toLowerCase().includes(q) || 
        r.dudi.toLowerCase().includes(q) || 
        r.pembimbing.toLowerCase().includes(q)
      )
    }

    return results
  },

  getAllUsers: async (filters?: { query?: string, role?: string }): Promise<UserProfileData[]> => {
    let query = supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        role,
        created_at
      `)

    if (filters?.query) {
      query = query.or(`full_name.ilike.%${filters.query}%,email.ilike.%${filters.query}%`)
    }

    if (filters?.role && filters.role !== 'semua') {
      query = query.eq('role', filters.role.toUpperCase())
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error || !data) return []

    return data.map((u: {
      id: string;
      full_name: string;
      email: string;
      role: string;
      created_at: string;
    }) => ({
      id: u.id,
      fullName: u.full_name,
      email: u.email,
      role: u.role,
      isVerified: true, // Assuming default true for now as in the screenshot mockups
      createdAt: u.created_at
    }))
  },

  getActivityStats: async (): Promise<ActivityStats> => {
    const { count: total } = await supabase.from('activity_logs').select('*', { count: 'exact', head: true })
    const { count: created } = await supabase.from('activity_logs').select('*', { count: 'exact', head: true }).ilike('action', '%create%')
    const { count: updated } = await supabase.from('activity_logs').select('*', { count: 'exact', head: true }).ilike('action', '%update%')
    const { count: deleted } = await supabase.from('activity_logs').select('*', { count: 'exact', head: true }).ilike('action', '%delete%')

    return {
      total: total || 0,
      created: created || 0,
      updated: updated || 0,
      deleted: deleted || 0
    }
  },

  getAllLogs: async (filters?: { query?: string, action?: string, entity?: string }): Promise<ActivityLog[]> => {
    let query = supabase
      .from('activity_logs')
      .select(`
        id,
        action,
        entity_type,
        details,
        created_at,
        profiles (full_name)
      `)

    if (filters?.action && filters.action !== 'all') {
      query = query.ilike('action', `%${filters.action}%`)
    }

    if (filters?.entity && filters.entity !== 'all') {
      query = query.eq('entity_type', filters.entity)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error || !data) return []

    let results: ActivityLog[] = (data as {
      id: string;
      action: string;
      entity_type: string | null;
      details: unknown;
      created_at: string;
      profiles: { full_name: string }[] | { full_name: string } | null;
    }[]).map((l) => {
      const profile = Array.isArray(l.profiles) ? l.profiles[0] : l.profiles;
      return {
        id: l.id,
        userName: profile?.full_name || 'System',
        action: l.action,
        entityType: l.entity_type || '-',
        details: typeof l.details === 'object' ? JSON.stringify(l.details) : String(l.details || '-'),
        createdAt: l.created_at
      }
    })

    if (filters?.query) {
      const q = filters.query.toLowerCase()
      results = results.filter((r: ActivityLog) => 
        r.userName.toLowerCase().includes(q) || 
        r.action.toLowerCase().includes(q) || 
        r.details.toLowerCase().includes(q)
      )
    }

    return results
  },

  clearLogs: async (): Promise<boolean> => {
    const { error } = await supabase.from('activity_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000') // Deleting all rows
    return !error
  },

  getSchoolSettings: async (): Promise<SchoolSettings | null> => {
    const { data, error } = await supabase
      .from('sekolah_settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (error || !data) return null

    return {
      id: data.id,
      npsn: data.npsn || '',
      namaSekolah: data.nama_sekolah || '',
      alamatSekolah: data.alamat_sekolah || '',
      telepon: data.telepon || '',
      email: data.email || '',
      website: data.website || '',
      kepalaSekolah: data.kepala_sekolah || '',
      nipKepalaSekolah: data.nip_kepala_sekolah || '',
      logoUrl: data.logo_url || '',
      headerSuratUrl: data.header_surat_url || '',
      updatedAt: data.updated_at
    }
  },

  updateSchoolSettings: async (settings: Partial<SchoolSettings>): Promise<boolean> => {
    const updateData: Record<string, string | number | boolean | null | undefined> = {}
    if (settings.npsn !== undefined) updateData.npsn = settings.npsn
    if (settings.namaSekolah !== undefined) updateData.nama_sekolah = settings.namaSekolah
    if (settings.alamatSekolah !== undefined) updateData.alamat_sekolah = settings.alamatSekolah
    if (settings.telepon !== undefined) updateData.telepon = settings.telepon
    if (settings.email !== undefined) updateData.email = settings.email
    if (settings.website !== undefined) updateData.website = settings.website
    if (settings.kepalaSekolah !== undefined) updateData.kepala_sekolah = settings.kepalaSekolah
    if (settings.nipKepalaSekolah !== undefined) updateData.nip_kepala_sekolah = settings.nipKepalaSekolah
    if (settings.logoUrl !== undefined) updateData.logo_url = settings.logoUrl
    if (settings.headerSuratUrl !== undefined) updateData.header_surat_url = settings.headerSuratUrl

    const { error } = await supabase
      .from('sekolah_settings')
      .update(updateData)
      .eq('id', 1)

    return !error
  },

  uploadFile: async (file: File, bucket: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `settings/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file)

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return null
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return data.publicUrl
  },

  getTeacherOptions: async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'GURU')
    return data?.map(g => ({ id: g.id, nama: g.full_name })) || []
  },

  getDudiOptions: async () => {
    const { data } = await supabase
      .from('dudi')
      .select('id, nama_perusahaan')
    return data?.map(d => ({ id: d.id, name: d.nama_perusahaan })) || []
  }
}
