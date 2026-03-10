import { NextResponse } from 'next/server'
import { adminService } from '@/services/adminService'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || ''
  const role = searchParams.get('role') || 'semua'

  try {
    const users = await adminService.getAllUsers({ query, role })

    return NextResponse.json({
      users
    })
  } catch (error) {
    console.error('Error fetching User data:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data user' },
      { status: 500 }
    )
  }
}
