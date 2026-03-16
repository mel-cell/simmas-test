import { NextResponse } from 'next/server'
import { authServerService as authService } from '@/services/authServerService'
import { approvalGuruService } from '@/services/approval.guruService'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profileData = await authService.getProfile()
    const role = profileData?.profile?.role || profileData?.user?.user_metadata?.role

    if (!profileData?.user || role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { status, notes } = body

    if (!['disetujui', 'ditolak'].includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })
    }

    const success = await approvalGuruService.approveJournal(id, profileData.user.id, status, notes)
    return NextResponse.json({ success })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal update status jurnal'
    return NextResponse.json(
      { error: message },
      { status: 400 }
    )
  }
}
