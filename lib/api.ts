import { AdminStats, RecentMagang, RecentLogbook, ActiveDudi } from '@/types/admin'

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

// Sentralisasi semua panggilan API (Client-Side)
export const api = {
  admin: {
    getDashboard: () => fetcher<DashboardDataResponse>('/api/admin/dashboard'),
    // Nanti bisa ditambahkan endpoint lain di sini:
    // getGurus: () => fetcher('/api/admin/gurus'),
    // getSiswa: () => fetcher('/api/admin/siswa'),
  },
}
