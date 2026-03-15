import { NextResponse } from 'next/server'
import { authServerService as authService } from '@/services/authServerService'
import { magangGuruService } from '@/services/magang.guruService'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const profileData = await authService.getProfile()
    const role = profileData?.profile?.role || profileData?.user?.user_metadata?.role

    if (!profileData?.user || role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, ...data } = body

    let success = false
    if (type === 'status') {
      success = await magangGuruService.updateMagangStatus(id, {
        status: data.status,
        tgl_mulai: data.tgl_mulai,
        tgl_selesai: data.tgl_selesai,
        catatan: data.catatan
      })
    } else if (type === 'nilai') {
      const nilai = parseInt(data.nilai)
      if (isNaN(nilai) || nilai < 0 || nilai > 100) {
        return NextResponse.json({ error: 'Nilai harus antara 0-100' }, { status: 400 })
      }
      success = await magangGuruService.inputNilai(id, nilai)
    } else {
      return NextResponse.json({ error: 'Tipe update tidak valid' }, { status: 400 })
    }

    return NextResponse.json({ success })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal update data magang'
    return NextResponse.json(
      { error: message },
      { status: 400 }
    )
  }
}
