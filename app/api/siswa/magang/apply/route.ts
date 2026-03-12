import { NextResponse } from 'next/server'
import { authServerService as authService } from '@/services/authServerService'
import { siswaService } from '@/services/siswaService'

export async function POST(req: Request) {
  try {
    const profileData = await authService.getProfile()
    if (!profileData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { dudiId } = await req.json()
    if (!dudiId) {
      return NextResponse.json({ error: 'ID DUDI diperlukan' }, { status: 400 })
    }

    const success = await siswaService.applyForInternship(profileData.user.id, dudiId)
    return NextResponse.json({ success })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Gagal melakukan pendaftaran' },
      { status: 400 }
    )
  }
}
