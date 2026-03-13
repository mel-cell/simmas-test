import { NextResponse } from 'next/server'
import { authServerService as authService } from '@/services/authServerService'
import { guruService } from '@/services/guruService'

export async function GET(req: Request) {
  try {
    const profileData = await authService.getProfile()
    if (!profileData?.user || profileData.user.user_metadata?.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined
    const query = searchParams.get('query') || undefined

    const data = await guruService.getBimbinganSiswa(profileData.user.id, { status, query })
    return NextResponse.json({ bimbingan: data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal update data magang'
    return NextResponse.json(
      { error: message },
      { status: 400 }
    )
  }
}
