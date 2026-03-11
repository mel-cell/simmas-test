import { NextResponse } from 'next/server'
import { magangAdminService } from '@/services/magang.adminService'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || ''
  const status = searchParams.get('status') || 'semua'

  try {
    const [stats, internships] = await Promise.all([
      magangAdminService.getInternshipStats(),
      magangAdminService.getAllMagang({ query, status })
    ])

    return NextResponse.json({
      stats,
      internships
    })
  } catch (error) {
    console.error('Error fetching Internship data:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data penempatan magang' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const success = await magangAdminService.createMagang(body)
    return NextResponse.json({ success })
  } catch (error) {
    console.error('Error creating magang:', error)
    return NextResponse.json({ error: 'Gagal membuat data magang' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    const success = await magangAdminService.updateMagang(id, data)
    return NextResponse.json({ success })
  } catch (error) {
    console.error('Error updating magang:', error)
    return NextResponse.json({ error: 'Gagal memperbarui data magang' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { id } = body
    const success = await magangAdminService.deleteMagang(id)
    return NextResponse.json({ success })
  } catch (error) {
    console.error('Error deleting magang:', error)
    return NextResponse.json({ error: 'Gagal menghapus data magang' }, { status: 500 })
  }
}
