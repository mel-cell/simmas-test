import { NextResponse } from 'next/server'
import { authServerService as authService } from '@/services/authServerService'
import { siswaService } from '@/services/siswaService'

export async function GET() {
  try {
    const profileData = await authService.getProfile()
    if (!profileData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const applications = await siswaService.getInternshipApplications(profileData.user.id)
    return NextResponse.json({ applications })
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal memuat riwayat pendaftaran' },
      { status: 500 }
    )
  }
}
