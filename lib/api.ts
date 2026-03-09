import { AdminStats, RecentMagang, RecentLogbook, ActiveDudi, SiswaData, GuruData } from '@/types/admin'

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

// Sentralisasi semua panggilan API (Client-Side)
export const api = {
  admin: {
    getDashboard: () => fetcher<DashboardDataResponse>('/api/admin/dashboard'),
    getStudents: (params?: { query?: string, status?: string, kelas?: string }) => {
      const searchParams = new URLSearchParams(params as Record<string, string>).toString()
      return fetcher<StudentDataResponse>(`/api/admin/siswa?${searchParams}`)
    },
    getTeachers: (params?: { query?: string, status?: string }) => {
      const searchParams = new URLSearchParams(params as Record<string, string>).toString()
      return fetcher<TeacherDataResponse>(`/api/admin/guru?${searchParams}`)
    },
  },
}
