import { NextResponse } from 'next/server'
import { adminService } from '@/services/adminService'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || ''
  const status = searchParams.get('status') || 'semua'
  const kelas = searchParams.get('kelas') || 'semua'

  try {
    const [stats, students] = await Promise.all([
      adminService.getStudentStats(),
      adminService.getAllSiswa({ query, status, kelas })
    ])

    return NextResponse.json({
      stats,
      students
    })
  } catch (error) {
    console.error('Error fetching student data:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data siswa' },
      { status: 500 }
    )
  }
}
