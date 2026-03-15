import { NextResponse } from 'next/server'
import { authServerService as authService } from '@/services/authServerService'
import { dashboardGuruService } from '@/services/dashboard.guruService'

export async function GET() {
  try {
    const profileData = await authService.getProfile()
    const role = profileData?.profile?.role || profileData?.user?.user_metadata?.role
    
    if (!profileData?.user || role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await dashboardGuruService.getDashboardData(profileData.user.id)
    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal mengambil data dashboard'
    return NextResponse.json(
      { error: message },
      { status: 400 }
    )
  }
}
