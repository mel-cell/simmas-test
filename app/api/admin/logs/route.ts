import { NextResponse } from 'next/server'
import { adminService } from '@/services/adminService'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || ''
  const action = searchParams.get('action') || 'all'
  const entity = searchParams.get('entity') || 'all'

  try {
    const [stats, logs] = await Promise.all([
      adminService.getActivityStats(),
      adminService.getAllLogs({ query, action, entity })
    ])

    return NextResponse.json({
      stats,
      logs
    })
  } catch (error) {
    console.error('Error fetching Activity Log data:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data log aktivitas' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const success = await adminService.clearLogs()
    return NextResponse.json({ success })
  } catch (error) {
    console.error('Error clearing logs:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus log' },
      { status: 500 }
    )
  }
}
