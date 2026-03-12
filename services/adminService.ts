import { createClient as createServerClient } from '@/lib/supabaseServer'
import { 
  AdminStats, 
  RecentMagang, 
  RecentLogbook, 
  ActiveDudi, 
  TeacherStats, 
  GuruData, 
  DudiStats, 
  InternshipStats, 
  UserProfileData, 
  ActivityLog, 
  ActivityStats, 
  SchoolSettings 
} from '@/types/admin'
import { logActivity } from './activityLogger'

export const adminService = {
  getDashboardStats: async (): Promise<AdminStats> => {
    const supabase = await createServerClient()
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
      .in('status', ['aktif', 'berjalan', 'menunggu']) 
      
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
    const supabase = await createServerClient()
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

    return (data as unknown[]).map((i) => {
      const item = i as Record<string, unknown>
      const siswa = item.siswa as Record<string, unknown> | Record<string, unknown>[] | null
      const guru = item.guru as Record<string, unknown> | Record<string, unknown>[] | null
      const dudi = item.dudi as Record<string, unknown> | Record<string, unknown>[] | null
      
      const siswaData = Array.isArray(siswa) ? siswa[0] : siswa
      const guruData = Array.isArray(guru) ? guru[0] : guru
      const dudiData = Array.isArray(dudi) ? dudi[0] : dudi
      
      return {
        id: item.id as string,
        namaSiswa: (siswaData?.full_name as string) || 'Tidak diketahui',
        dudi: (dudiData?.nama_perusahaan as string) || 'Tidak diketahui',
        pembimbing: (guruData?.full_name as string) || 'Belum ditugaskan',
        startDate: (item.tgl_mulai as string) || '-',
        endDate: (item.tgl_selesai as string) || '-',
        status: (item.status as string) || 'menunggu',
      }
    })
  },

  getRecentLogbooks: async (): Promise<RecentLogbook[]> => {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('logbooks')
      .select('id, kegiatan, tanggal, kendala, status')
      .order('created_at', { ascending: false })
      .limit(3)
      
    if (error || !data) return []
    
    return (data as unknown[]).map((i) => {
      const item = i as Record<string, unknown>
      const status = item.status as string
      return {
        id: item.id as string,
        kegiatan: item.kegiatan as string,
        tanggal: item.tanggal as string,
        kendala: item.kendala as string | null,
        status: status === 'pending' ? 'pending' : (status === 'Disetujui' || status === 'approved' ? 'Disetujui' : 'Ditolak'),
      }
    })
  },

  getActiveDudi: async (): Promise<ActiveDudi[]> => {
    const supabase = await createServerClient()
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
    
    return (data as unknown[]).map((i) => {
      const item = i as Record<string, unknown>
      const magang = item.magang as { count: number }[] | null
      return {
        id: item.id as string,
        namaPerusahaan: item.nama_perusahaan as string,
        alamat: item.alamat as string,
        email: (item.email as string) || '-',
        noTelp: (item.no_telp as string) || '-',
        penanggungJawab: (item.penanggung_jawab as string) || '-',
        jumlahSiswa: magang && magang[0] ? magang[0].count : 0,
        status: item.is_active as boolean
      }
    })
  },

  getTeacherStats: async (): Promise<TeacherStats> => {
    const supabase = await createServerClient()
    const { count: total } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'GURU')

    const { count: aktif } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'GURU')
      .eq('status', 'aktif')

    const { count: totalBimbingan } = await supabase
      .from('magang')
      .select('*', { count: 'exact', head: true })
    
    const rataRataSiswa = total && total > 0 ? Math.round((totalBimbingan || 0) / total) : 0

    return {
      total: total || 0,
      aktif: aktif || 0,
      totalBimbingan: totalBimbingan || 0,
      rataRataSiswa
    }
  },

  getAllGuru: async (filters?: { query?: string, status?: string }): Promise<GuruData[]> => {
    const supabase = await createServerClient()
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

    return (data as unknown[]).map((i) => {
      const g = i as Record<string, unknown>
      const magangCount = g.magang_count as { count: number }[] | null
      return {
        id: g.id as string,
        nip: (g.nomor_induk as string) || '-',
        nama: g.full_name as string,
        mataPelajaran: (g.jurusan as string) || 'Tidak Diatur', 
        email: g.email as string,
        nohp: (g.no_telp as string) || '-',
        totalSiswa: magangCount && magangCount.length > 0 ? magangCount[0].count : 0,
        status: (g.status as string) || 'aktif'
      }
    })
  },

  getDudiStats: async (): Promise<DudiStats> => {
    const supabase = await createServerClient()
    const { count: total } = await supabase
      .from('dudi')
      .select('*', { count: 'exact', head: true })

    const { count: aktif } = await supabase
      .from('dudi')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    const tidakAktif = (total || 0) - (aktif || 0)

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
    const supabase = await createServerClient()
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

    return (data as unknown[]).map((i) => {
      const d = i as Record<string, unknown>
      const magangCount = d.magang_count as { count: number }[] | null
      return {
        id: d.id as string,
        namaPerusahaan: d.nama_perusahaan as string,
        alamat: d.alamat as string,
        email: (d.email as string) || '-',
        noTelp: (d.no_telp as string) || '-',
        penanggungJawab: (d.penanggung_jawab as string) || '-',
        jumlahSiswa: magangCount && magangCount.length > 0 ? magangCount[0].count : 0,
        status: d.is_active as boolean
      }
    })
  },

  getInternshipStats: async (): Promise<InternshipStats> => {
    const supabase = await createServerClient()
    const { count: total } = await supabase
      .from('magang')
      .select('*', { count: 'exact', head: true })

    const { count: aktif } = await supabase
      .from('magang')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'aktif')

    const { count: selesai } = await supabase
      .from('magang')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'selesai')

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
        siswa:siswa_id (full_name),
        guru:guru_id (full_name),
        dudi:dudi_id (nama_perusahaan)
      `)

    if (filters?.status && filters.status !== 'semua') {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error || !data) return []

    let results: RecentMagang[] = (data as unknown[]).map((i) => {
      const m = i as Record<string, unknown>
      const siswa = m.siswa as Record<string, unknown> | Record<string, unknown>[] | null
      const guru = m.guru as Record<string, unknown> | Record<string, unknown>[] | null
      const dudi = m.dudi as Record<string, unknown> | Record<string, unknown>[] | null

      const siswaData = Array.isArray(siswa) ? siswa[0] : siswa
      const guruData = Array.isArray(guru) ? guru[0] : guru
      const dudiData = Array.isArray(dudi) ? dudi[0] : dudi

      return {
        id: m.id as string,
        namaSiswa: (siswaData?.full_name as string) || 'Tidak diketahui',
        dudi: (dudiData?.nama_perusahaan as string) || 'Tidak diketahui',
        pembimbing: (guruData?.full_name as string) || 'Belum ditugaskan',
        startDate: (m.tgl_mulai as string) || '-',
        endDate: (m.tgl_selesai as string) || '-',
        status: (m.status as string) || 'menunggu'
      }
    })

    if (filters?.query) {
      const q = filters.query.toLowerCase()
      results = results.filter((r) => 
        r.namaSiswa.toLowerCase().includes(q) || 
        r.dudi.toLowerCase().includes(q) || 
        r.pembimbing.toLowerCase().includes(q)
      )
    }

    return results
  },

  getAllUsers: async (filters?: { query?: string, role?: string }): Promise<UserProfileData[]> => {
    const supabase = await createServerClient()
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

    return (data as unknown[]).map((i) => {
      const u = i as Record<string, unknown>
      return {
        id: u.id as string,
        fullName: u.full_name as string,
        email: u.email as string,
        role: u.role as string,
        isVerified: true, 
        createdAt: u.created_at as string
      }
    })
  },

  getActivityStats: async (): Promise<ActivityStats> => {
    const supabase = await createServerClient()
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

  getAllLogs: async (filters?: { query?: string, action?: string, entity?: string, limit?: number }): Promise<ActivityLog[]> => {
    const supabase = await createServerClient()
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

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error || !data) return []

    let results: ActivityLog[] = (data as unknown[]).map((i) => {
      const l = i as Record<string, unknown>
      const profiles = l.profiles as Record<string, unknown> | Record<string, unknown>[] | null
      const profileData = Array.isArray(profiles) ? profiles[0] : profiles
      return {
        id: l.id as string,
        userName: (profileData?.full_name as string) || 'System',
        action: l.action as string,
        entityType: (l.entity_type as string) || '-',
        details: typeof l.details === 'object' && l.details !== null ? (l.details as Record<string, unknown>) : null,
        createdAt: l.created_at as string
      }
    })

    if (filters?.query) {
      const q = filters.query.toLowerCase()
      results = results.filter((r) => {
        const detailsStr = typeof r.details === 'object' ? JSON.stringify(r.details).toLowerCase() : String(r.details).toLowerCase()
        return (
          r.userName.toLowerCase().includes(q) || 
          r.action.toLowerCase().includes(q) || 
          detailsStr.includes(q)
        )
      })
    }

    return results
  },

  clearLogs: async (): Promise<boolean> => {
    const supabase = await createServerClient()
    const { error } = await supabase.from('activity_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000') 
    return !error
  },

  getSchoolSettings: async (): Promise<SchoolSettings | null> => {
    const supabase = await createServerClient()
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
    const supabase = await createServerClient()
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

    if (!error) {
      await logActivity('Update', 'PENGATURAN', '1', updateData)
    }

    return !error
  },

  getTeacherOptions: async () => {
    const supabase = await createServerClient()
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'GURU')
    return (data || []).map((i: unknown) => {
      const g = i as Record<string, unknown>
      return { id: (g.id as string), nama: (g.full_name as string) }
    })
  },

  getDudiOptions: async () => {
    const supabase = await createServerClient()
    const { data } = await supabase
      .from('dudi')
      .select('id, nama_perusahaan')
    return (data || []).map((i: unknown) => {
      const d = i as Record<string, unknown>
      return { id: (d.id as string), name: (d.nama_perusahaan as string) }
    })
  }
}
