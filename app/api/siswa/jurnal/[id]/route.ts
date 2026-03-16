import { NextResponse } from 'next/server'
import { authServerService as authService } from '@/services/authServerService'
import { siswaService } from '@/services/siswaService'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const profileData = await authService.getProfile()
    if (!profileData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const journal = await siswaService.getJournalDetail(id, profileData.user.id)
    return NextResponse.json(journal)
  } catch (err) {
    console.error('Error fetching journal detail:', err)
    return NextResponse.json({ error: 'Gagal mengambil detail' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const profileData = await authService.getProfile()
    if (!profileData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const success = await siswaService.updateJournal(id, profileData.user.id, body)
    
    return NextResponse.json({ success })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json(
      { error: error?.message || 'Gagal mengubah' },
      { status: error?.message?.includes('disetujui') ? 403 : 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const profileData = await authService.getProfile()
    if (!profileData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const success = await siswaService.deleteJournal(id, profileData.user.id)
    return NextResponse.json({ success })
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json(
      { error: error?.message || 'Gagal menghapus' },
      { status: error?.message?.includes('disetujui') ? 403 : 500 }
    )
  }
}
