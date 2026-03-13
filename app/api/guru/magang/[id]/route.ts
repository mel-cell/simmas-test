import { NextResponse } from 'next/server'
import { authServerService as authService } from '@/services/authServerService'
import { guruService } from '@/services/guruService'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const profileData = await authService.getProfile()
    if (!profileData?.user || profileData.user.user_metadata?.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json()

    let success = false
    if (body.type === 'status') {
      success = await guruService.updateMagangStatus(id, {
        status: body.status,
        tgl_mulai: body.tgl_mulai,
        tgl_selesai: body.tgl_selesai,
        catatan: body.catatan
      })
    } else if (body.type === 'nilai') {
      const nilai = Number(body.nilai)
      if (isNaN(nilai) || nilai < 0 || nilai > 100) {
        return NextResponse.json({ error: 'Nilai harus antara 0-100' }, { status: 400 })
      }
      success = await guruService.inputNilai(id, nilai)
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
