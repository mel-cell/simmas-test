import { NextResponse } from 'next/server'
import { authServerService as authService } from '@/services/authServerService'
import { magangGuruService } from '@/services/magang.guruService'

export async function GET(req: Request) {
  try {
    const profileData = await authService.getProfile()
    const role = profileData?.profile?.role || profileData?.user?.user_metadata?.role

    if (!profileData?.user || role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined
    const query = searchParams.get('query') || undefined

    const data = await magangGuruService.getBimbinganSiswa(profileData.user.id, { status, query })
    return NextResponse.json({ bimbingan: data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal update data magang'
    return NextResponse.json(
      { error: message },
      { status: 400 }
    )
  }
}
