import { NextResponse } from 'next/server'
import { adminService } from '@/services/adminService'

export async function GET() {
  try {
    const options = await adminService.getDudiOptions()
    return NextResponse.json(options)
  } catch (error) {
    console.error('Error fetching dudi options:', error)
    return NextResponse.json({ error: 'Gagal mengambil pilihan DUDI' }, { status: 500 })
  }
}
