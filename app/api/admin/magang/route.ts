import { NextResponse } from 'next/server'
import { adminService } from '@/services/adminService'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || ''
  const status = searchParams.get('status') || 'semua'

  try {
    const [stats, internships] = await Promise.all([
      adminService.getInternshipStats(),
      adminService.getAllMagang({ query, status })
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
