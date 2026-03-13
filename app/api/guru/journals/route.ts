import { NextResponse } from 'next/server'
import { authServerService as authService } from '@/services/authServerService'
import { guruService } from '@/services/guruService'

export async function GET() {
  try {
    const profileData = await authService.getProfile()
    if (!profileData?.user || profileData.user.user_metadata?.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await guruService.getJournalsForApproval(profileData.user.id)
    return NextResponse.json({ journals: data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal mengambil data jurnal'
    return NextResponse.json(
      { error: message },
      { status: 400 }
    )
  }
}
