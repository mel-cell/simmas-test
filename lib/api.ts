import { AdminStats, RecentMagang, RecentLogbook, ActiveDudi, SiswaData, GuruData, InternshipStats, UserProfileData, ActivityLog, ActivityStats, SchoolSettings, SiswaInput } from '@/types/admin'
import { SiswaDashboardResponse, SiswaJournal, SiswaDudi, SiswaApplication } from '@/types/siswa'
import { GuruDashboardResponse, BimbinganSiswa, GuruJournalApproval } from '@/types/guru'

// Konfigurasi dasar fetch
const fetcher = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!res.ok) {
    throw new Error(`API Error: ${res.statusText}`)
  }

  return res.json()
}

const toQueryString = (params?: Record<string, string | number | undefined | null>): string => {
  if (!params) return ''
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString())
    }
  })
  const qs = searchParams.toString()
  return qs ? `?${qs}` : ''
}

export type DashboardDataResponse = {
  stats: AdminStats
  recent: RecentMagang[]
  recentLogbooks: RecentLogbook[]
  activeDudis: ActiveDudi[]
}

export type StudentDataResponse = {
  stats: {
    total: number
    sedangMagang: number
    selesaiMagang: number
    belumAdaPembimbing: number
  }
  students: SiswaData[]
}

export type TeacherDataResponse = {
  stats: {
    total: number
    aktif: number
    totalBimbingan: number
    rataRataSiswa: number
  }
  teachers: GuruData[]
}

export type DudiDataResponse = {
  stats: {
    total: number
    aktif: number
    tidakAktif: number
    totalSiswaMagang: number
  }
  dudi: ActiveDudi[]
}

export type InternshipDataResponse = {
  stats: InternshipStats
  internships: RecentMagang[]
}

export type UserDataResponse = {
  users: UserProfileData[]
}

export type ActivityLogDataResponse = {
  stats: ActivityStats
  logs: ActivityLog[]
}

export type SchoolSettingsDataResponse = {
  settings: SchoolSettings | null
}

// Sentralisasi semua panggilan API (Client-Side)
export const api = {
  admin: {
    getDashboard: () => fetcher<DashboardDataResponse>('/api/admin/dashboard'),
    getStudents: (params?: { query?: string, status?: string, kelas?: string, jurusan?: string }) => {
      return fetcher<StudentDataResponse>(`/api/admin/siswa${toQueryString(params)}`)
    },
    getTeachers: (params?: { query?: string, status?: string, mataPelajaran?: string }) => {
      return fetcher<TeacherDataResponse>(`/api/admin/guru${toQueryString(params)}`)
    },
    getDudis: (params?: { query?: string, status?: string }) => {
      return fetcher<DudiDataResponse>(`/api/admin/dudi${toQueryString(params)}`)
    },
    getInternships: (params?: { query?: string, status?: string }) => {
      return fetcher<InternshipDataResponse>(`/api/admin/magang${toQueryString(params)}`)
    },
    getUsers: (params?: { query?: string, role?: string }) => {
      return fetcher<UserDataResponse>(`/api/admin/users${toQueryString(params)}`)
    },

    // pengguna
    createUser: (user: Record<string, unknown>) => {
      return fetcher<{ success: boolean, error?: string }>('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(user)
      })
    },
    updateUser: (id: string, user: Record<string, unknown>) => {
      return fetcher<{ success: boolean, error?: string }>('/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify({ id, ...user })
      })
    },
    deleteUser: (id: string) => {
      return fetcher<{ success: boolean, error?: string }>('/api/admin/users', {
        method: 'DELETE',
        body: JSON.stringify({ id })
      })
    },

    // logs
    getLogs: (params?: { query?: string, action?: string, entity?: string }) => {
      return fetcher<ActivityLogDataResponse>(`/api/admin/logs${toQueryString(params)}`)
    },
    clearLogs: () => {
      return fetcher<{ success: boolean, error?: string }>('/api/admin/logs', { method: 'DELETE' })
    },
    getSettings: () => {
      return fetcher<SchoolSettingsDataResponse>('/api/admin/settings')
    },
    updateSettings: (settings: Partial<SchoolSettings>) => {
      return fetcher<{ success: boolean }>('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
    },
    createStudent: (student: SiswaInput) => {
      return fetcher<{ success: boolean, error?: string }>('/api/admin/siswa', {
        method: 'POST',
        body: JSON.stringify(student)
      })
    },
    updateStudent: (id: string, student: Partial<SiswaInput>) => {
      return fetcher<{ success: boolean, error?: string }>('/api/admin/siswa', {
        method: 'PATCH',
        body: JSON.stringify({ id, ...student })
      })
    },
    deleteStudent: (id: string) => {
      return fetcher<{ success: boolean, error?: string }>('/api/admin/siswa', {
        method: 'DELETE',
        body: JSON.stringify({ id })
      })
    },
    createTeacher: (teacher: Partial<GuruData> & { nip: string, nama: string, email: string }) => {
      return fetcher<{ success: boolean, error?: string }>('/api/admin/guru', {
        method: 'POST',
        body: JSON.stringify(teacher)
      })
    },
    updateTeacher: (id: string, teacher: Partial<GuruData>) => {
      return fetcher<{ success: boolean, error?: string }>('/api/admin/guru', {
        method: 'PATCH',
        body: JSON.stringify({ id, ...teacher })
      })
    },
    deleteTeacher: (id: string) => {
      return fetcher<{ success: boolean, error?: string }>('/api/admin/guru', {
        method: 'DELETE',
        body: JSON.stringify({ id })
      })
    },

    // dudi
    createDudi: (dudi: Partial<ActiveDudi> & { namaPerusahaan: string, alamat: string }) => {
      return fetcher<{ success: boolean, error?: string }>('/api/admin/dudi', {
        method: 'POST',
        body: JSON.stringify(dudi)
      })
    },
    updateDudi: (id: string, dudi: Partial<ActiveDudi>) => {
      return fetcher<{ success: boolean, error?: string }>('/api/admin/dudi', {
        method: 'PATCH',
        body: JSON.stringify({ id, ...dudi })
      })
    },
    deleteDudi: (id: string) => {
      return fetcher<{ success: boolean, error?: string }>('/api/admin/dudi', {
        method: 'DELETE',
        body: JSON.stringify({ id })
      })
    },
    getTeacherOptions: () => {
      return fetcher<{ id: string, nama: string }[]>('/api/admin/guru/options')
    },
    getDudiOptions: () => {
      return fetcher<{ id: string, name: string }[]>('/api/admin/dudi/options')
    },

    // siswa
    getSiswaOptions: () => {
      return fetcher<{ id: string, nama: string }[]>('/api/admin/siswa/options')
    },
    createInternship: (internship: Record<string, unknown>) => {
      return fetcher<{ success: boolean, error?: string }>('/api/admin/magang', {
        method: 'POST',
        body: JSON.stringify(internship)
      })
    },
    updateInternship: (id: string, internship: Record<string, unknown>) => {
      return fetcher<{ success: boolean, error?: string }>('/api/admin/magang', {
        method: 'PATCH',
        body: JSON.stringify({ id, ...internship })
      })
    },
    deleteInternship: (id: string) => {
      return fetcher<{ success: boolean, error?: string }>('/api/admin/magang', {
        method: 'DELETE',
        body: JSON.stringify({ id })
      })
    },
  },
  siswa: {
    getDashboard: () => fetcher<SiswaDashboardResponse>('/api/siswa/dashboard'),
    getAllJournals: () => fetcher<{ journals: SiswaJournal[] }>('/api/siswa/jurnal'),
    getJournalDetail: (id: string) => fetcher<SiswaJournal>(`/api/siswa/jurnal/${id}`),
    createJournal: (journal: { tgl: string, kegiatan: string, kendala?: string, status?: string, foto_url?: string }) => {
      return fetcher<{ success: boolean }>('/api/siswa/jurnal', {
        method: 'POST',
        body: JSON.stringify(journal)
      })
    },
    updateJournal: (id: string, journal: { kegiatan?: string, kendala?: string, status?: string, foto_url?: string }) => {
      return fetcher<{ success: boolean }>(`/api/siswa/jurnal/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(journal)
      })
    },
    deleteJournal: (id: string) => {
      return fetcher<{ success: boolean }>(`/api/siswa/jurnal/${id}`, {
        method: 'DELETE'
      })
    },
    getAvailableDudis: () => fetcher<{ dudi: SiswaDudi[] }>('/api/siswa/magang/available'),
    getApplications: () => fetcher<{ applications: SiswaApplication[] }>('/api/siswa/magang/applications'),
    getAvailableTeachers: () => fetcher<{ teachers: { id: string, full_name: string, nomor_induk: string, jurusan: string, email: string }[] }>('/api/siswa/magang/teachers'),
    applyInternship: (dudiId: string, guruId: string) => {
      return fetcher<{ success: boolean }>('/api/siswa/magang/apply', {
        method: 'POST',
        body: JSON.stringify({ dudiId, guruId })
      })
    },
  },
  guru: {
    getDashboard: () => fetcher<GuruDashboardResponse>('/api/guru/dashboard'),
    getBimbingan: (params?: { query?: string, status?: string }) => {
      return fetcher<{ bimbingan: BimbinganSiswa[] }>(`/api/guru/magang${toQueryString(params)}`)
    },
    updateMagangStatus: (id: string, data: { status: string, tgl_mulai?: string, tgl_selesai?: string, catatan?: string }) => {
      return fetcher<{ success: boolean }>(`/api/guru/magang/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ type: 'status', ...data })
      })
    },
    inputNilai: (id: string, nilai: number) => {
      return fetcher<{ success: boolean }>(`/api/guru/magang/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ type: 'nilai', nilai })
      })
    },
    getJournals: () => fetcher<{ journals: GuruJournalApproval[], internships: BimbinganSiswa[] }>('/api/guru/journals'),
    approveJournal: (id: string, status: 'disetujui' | 'ditolak', notes?: string) => {
      return fetcher<{ success: boolean }>(`/api/guru/journals/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes })
      })
    }
  }
}
