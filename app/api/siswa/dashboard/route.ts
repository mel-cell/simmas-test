import { NextResponse } from 'next/server'
import { authServerService as authService } from '@/services/authServerService'
import { siswaService } from '@/services/siswaService'

export async function GET() {
  try {
    const profileData = await authService.getProfile()
    if (!profileData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dashboardData = await siswaService.getDashboardData(profileData.user.id)
    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error fetching student dashboard:', error)
    return NextResponse.json(
      { error: 'Gagal memuat data dashboard' },
      { status: 500 }
    )
  }
}
