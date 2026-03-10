import { NextResponse } from 'next/server'
import { adminService } from '@/services/adminService'

export async function GET() {
  try {
    const settings = await adminService.getSchoolSettings()
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching School Settings:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil pengaturan sekolah' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const success = await adminService.updateSchoolSettings(body)
    return NextResponse.json({ success })
  } catch (error) {
    console.error('Error updating School Settings:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui pengaturan sekolah' },
      { status: 500 }
    )
  }
}
