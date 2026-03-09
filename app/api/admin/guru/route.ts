import { NextResponse } from 'next/server'
import { adminService } from '@/services/adminService'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || ''
  const status = searchParams.get('status') || 'semua'

  try {
    const [stats, teachers] = await Promise.all([
      adminService.getTeacherStats(),
      adminService.getAllGuru({ query, status })
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
