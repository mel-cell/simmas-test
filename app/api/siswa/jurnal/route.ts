import { NextResponse } from 'next/server'
import { authServerService as authService } from '@/services/authServerService'
import { siswaService } from '@/services/siswaService'

// List all journals for the current student
export async function GET() {
  try {
    const profileData = await authService.getProfile()
    if (!profileData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const journals = await siswaService.getAllJournals(profileData.user.id)
    return NextResponse.json({ journals })
  } catch (error) {
    console.error('Error fetching journals:', error)
    return NextResponse.json(
      { error: 'Gagal memuat daftar jurnal' },
      { status: 500 }
    )
  }
}

// Create new journal (draft or waiting)
export async function POST(request: Request) {
  try {
    const profileData = await authService.getProfile()
    if (!profileData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const success = await siswaService.createJournal({
      ...body,
      siswa_id: profileData.user.id
    })
    
    return NextResponse.json({ success })
  } catch (err: unknown) {
    const error = err as Error
    console.error('Error creating journal:', error)
    return NextResponse.json(
      { error: error?.message || 'Gagal membuat jurnal harian' },
      { status: error?.message?.includes('sudah ada') ? 400 : 500 }
    )
  }
}
