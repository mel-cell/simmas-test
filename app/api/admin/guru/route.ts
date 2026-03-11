import { NextResponse } from 'next/server'
import { guruAdminService } from '@/services/guru.adminService'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || ''
  const status = searchParams.get('status') || 'semua'

  try {
    const [stats, teachers] = await Promise.all([
      guruAdminService.getTeacherStats(),
      guruAdminService.getAllGuru({ query, status })
    ])

    return NextResponse.json({
      stats,
      teachers
    })
  } catch (error) {
    console.error('Error fetching teacher data:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data guru' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const success = await guruAdminService.createGuru(body)
    return NextResponse.json({ success })
  } catch (error) {
    console.error('Error creating guru:', error)
    return NextResponse.json({ error: 'Gagal membuat data guru' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    const success = await guruAdminService.updateGuru(id, data)
    return NextResponse.json({ success })
  } catch (error) {
    console.error('Error updating guru:', error)
    return NextResponse.json({ error: 'Gagal memperbarui data guru' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { id } = body
    const success = await guruAdminService.deleteGuru(id)
    return NextResponse.json({ success })
  } catch (error) {
    console.error('Error deleting guru:', error)
    return NextResponse.json({ error: 'Gagal menghapus data guru' }, { status: 500 })
  }
}
