import { NextResponse } from 'next/server'
import { authServerService as authService } from '@/services/authServerService'
import { guruService } from '@/services/guruService'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const profileData = await authService.getProfile()
    if (!profileData?.user || profileData.user.user_metadata?.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const { status, notes } = await req.json()

    if (!['disetujui', 'ditolak'].includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })
    }

    const success = await guruService.approveJournal(id, status, notes)
    return NextResponse.json({ success })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal update status jurnal'
    return NextResponse.json(
      { error: message },
      { status: 400 }
    )
  }
}
