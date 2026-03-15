import { NextResponse } from 'next/server'
import { usersAdminService } from '@/services/users.adminService'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || ''
  const role = searchParams.get('role') || 'semua'

  try {
    const users = await usersAdminService.getAllUsers({ query, role })
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching Users data:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data user' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await usersAdminService.createUser(body)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ success: false, error: 'Gagal membuat data user' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    const result = await usersAdminService.updateUser(id, data)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ success: false, error: 'Gagal memperbarui data user' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { id } = body
    const result = await usersAdminService.deleteUser(id)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ success: false, error: 'Gagal menghapus data user' }, { status: 500 })
  }
}
