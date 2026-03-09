import { NextResponse } from 'next/server'
import { adminService } from '@/services/adminService'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || ''
  const status = searchParams.get('status') || 'semua'

  try {
    const [stats, dudi] = await Promise.all([
      adminService.getDudiStats(),
      adminService.getAllDudi({ query, status })
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
