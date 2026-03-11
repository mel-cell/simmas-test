import { NextResponse } from 'next/server'
import { magangAdminService } from '@/services/magang.adminService'

export async function GET() {
  try {
    const options = await magangAdminService.getSiswaOptions()
    return NextResponse.json(options)
  } catch (error) {
    console.error('Error fetching siswa options:', error)
    return NextResponse.json({ error: 'Gagal mengambil pilihan siswa' }, { status: 500 })
  }
}
