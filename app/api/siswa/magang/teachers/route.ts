import { NextResponse } from 'next/server'
import { authServerService as authService } from '@/services/authServerService'
import { siswaService } from '@/services/siswaService'

export async function GET() {
  try {
    const profileData = await authService.getProfile()
    if (!profileData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const teachers = await siswaService.getAvailableTeachers()
    return NextResponse.json({ teachers })
  } catch {
    return NextResponse.json(
      { error: 'Gagal mengambil data guru pembimbing' },
      { status: 500 }
    )
  }
}
