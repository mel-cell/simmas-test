import { NextResponse } from 'next/server'
import { adminService } from '@/services/adminService'

export async function GET() {
  try {
    const options = await adminService.getTeacherOptions()
    return NextResponse.json(options)
  } catch (error) {
    console.error('Error fetching teacher options:', error)
    return NextResponse.json({ error: 'Gagal mengambil pilihan guru' }, { status: 500 })
  }
}
