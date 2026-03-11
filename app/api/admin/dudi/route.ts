import { NextResponse } from 'next/server'
import { dudiAdminService } from '@/services/dudi.adminService'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || ''
  const status = searchParams.get('status') || 'semua'

  try {
    const [stats, dudi] = await Promise.all([
      dudiAdminService.getDudiStats(),
      dudiAdminService.getAllDudi({ query, status })
    ])

    return NextResponse.json({
      stats,
      dudi
    })
  } catch (error) {
    console.error('Error fetching DUDI data:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data DUDI' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const success = await dudiAdminService.createDudi(body)
    return NextResponse.json({ success })
  } catch (error) {
    console.error('Error creating DUDI:', error)
    return NextResponse.json({ error: 'Gagal membuat data DUDI' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    const success = await dudiAdminService.updateDudi(id, data)
    return NextResponse.json({ success })
  } catch (error) {
    console.error('Error updating DUDI:', error)
    return NextResponse.json({ error: 'Gagal memperbarui data DUDI' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { id } = body
    const success = await dudiAdminService.deleteDudi(id)
    return NextResponse.json({ success })
  } catch (error) {
    console.error('Error deleting DUDI:', error)
    return NextResponse.json({ error: 'Gagal menghapus data DUDI' }, { status: 500 })
  }
}
