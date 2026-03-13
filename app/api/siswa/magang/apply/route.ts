import { NextResponse } from 'next/server'
import { authServerService as authService } from '@/services/authServerService'
import { siswaService } from '@/services/siswaService'

export async function POST(req: Request) {
  try {
    const profileData = await authService.getProfile()
    if (!profileData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { dudiId, guruId } = await req.json()
    if (!dudiId) {
      return NextResponse.json({ error: 'ID DUDI diperlukan' }, { status: 400 })
    }

    const success = await siswaService.applyForInternship(profileData.user.id, dudiId, guruId)
    return NextResponse.json({ success })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal melakukan pendaftaran'
    return NextResponse.json(
      { error: message },
      { status: 400 }
    )
  }
}
