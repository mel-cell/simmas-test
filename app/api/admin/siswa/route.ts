import { NextResponse } from 'next/server'
import { siswaAdminService } from '@/services/siswa.adminService'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || ''
  const status = searchParams.get('status') || 'semua'
  const kelas = searchParams.get('kelas') || 'semua'
  const jurusan = searchParams.get('jurusan') || 'semua'

  try {
    const [stats, students] = await Promise.all([
      siswaAdminService.getStudentStats(),
      siswaAdminService.getAllSiswa({ query, status, kelas, jurusan })
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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await siswaAdminService.createSiswa(body)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json({ success: false, error: 'Gagal membuat data siswa' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    const result = await siswaAdminService.updateSiswa(id, data)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json({ success: false, error: 'Gagal memperbarui data siswa' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { id } = body
    const result = await siswaAdminService.deleteSiswa(id)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json({ success: false, error: 'Gagal menghapus data siswa' }, { status: 500 })
  }
}
