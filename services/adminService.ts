import { supabase } from '@/lib/supabase'
import { AdminStats, RecentMagang } from '@/types/admin'

export const adminService = {
  getDashboardStats: async (): Promise<AdminStats> => {
    // Mocking for now as per dashboard screenshot
    return {
      totalSiswa: 150,
      totalDudi: 45,
      siswaMagang: 120,
      logbookHariIni: 85,
    }
  },

  getRecentMagang: async (): Promise<RecentMagang[]> => {
    // Mocking for now
    return [
      {
        id: '1',
        namaSiswa: 'Ahmad Rizki',
        dudi: 'PT. Teknologi Nusantara',
        startDate: '2024-01-15',
        endDate: '2024-04-15',
        status: 'Aktif',
      },
      {
        id: '2',
        namaSiswa: 'Siti Nurhaliza',
        dudi: 'CV. Digital Kreativa',
        startDate: '2024-01-20',
        endDate: '2024-04-20',
        status: 'Aktif',
      },
    ]
  },
}
