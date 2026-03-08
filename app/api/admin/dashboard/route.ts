import { NextResponse } from 'next/server'
import { adminService } from '@/services/adminService'

export async function GET() {
  try {
    const [stats, recent, recentLogbooks, activeDudis] = await Promise.all([
      adminService.getDashboardStats(),
      adminService.getRecentMagang(),
      adminService.getRecentLogbooks(),
      adminService.getActiveDudi(),
    ])

    return NextResponse.json({
      stats,
      recent,
      recentLogbooks,
      activeDudis
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data dashboard' },
      { status: 500 }
    )
  }
}
