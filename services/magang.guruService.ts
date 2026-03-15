/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient as createServerClient } from '@/lib/supabaseServer'
import { BimbinganSiswa } from '@/types/guru'
import { logActivity } from './activityLogger'

export const magangGuruService = {
  getBimbinganSiswa: async (guruId: string, filters?: { status?: string, query?: string }) => {
    const supabase = await createServerClient()
    console.log('Fetching bimbingan for guruId:', guruId)
    
    let query = supabase
      .from('magang')
      .select(`
        id,
        siswa_id,
        tgl_mulai,
        tgl_selesai,
        status,
        nilai_akhir,
        catatan,
        siswa:profiles!magang_siswa_id_fkey (full_name, nomor_induk, kelas, jurusan),
        dudi:dudi_id (id, nama_perusahaan, alamat)
      `)
      .eq('guru_id', guruId)

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
       console.error('Error in getBimbinganSiswa:', error)
       return []
    }

    let results: BimbinganSiswa[] = (data || []).map((m: any) => {
      const siswa = Array.isArray(m.siswa) ? m.siswa[0] : m.siswa
      const dudi = Array.isArray(m.dudi) ? m.dudi[0] : m.dudi

      return {
        id: m.id,
        siswa_id: m.siswa_id,
        siswa: siswa || { full_name: 'Tidak diketahui', nomor_induk: '-', kelas: '-', jurusan: '-' },
        dudi: dudi || { id: '-', nama_perusahaan: 'Tidak diketahui', alamat: '-' },
        tgl_mulai: m.tgl_mulai || null,
        tgl_selesai: m.tgl_selesai || null,
        status: m.status || 'menunggu',
        nilai: m.nilai_akhir,
        catatan: m.catatan || ''
      }
    })

    if (filters?.query) {
      const q = filters.query.toLowerCase()
      results = results.filter(r => 
        r.siswa.full_name.toLowerCase().includes(q) || 
        r.dudi.nama_perusahaan.toLowerCase().includes(q)
      )
    }

    return results
  },

  updateMagangStatus: async (id: string, data: { status: string, tgl_mulai?: string, tgl_selesai?: string, catatan?: string }) => {
    const supabase = await createServerClient()
    
    // 1. Get student ID first
    const { data: currentMagang } = await supabase
      .from('magang')
      .select('siswa_id')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('magang')
      .update({
        status: data.status,
        tgl_mulai: data.tgl_mulai,
        tgl_selesai: data.tgl_selesai,
        catatan: data.catatan
      })
      .eq('id', id)

    if (!error && currentMagang?.siswa_id) {
      // 2. Synchronize Profile Status
      let profileStatus = 'aktif'
      if (data.status === 'aktif') {
        profileStatus = 'magang'
      } else if (data.status === 'selesai') {
        profileStatus = 'selesai'
      }

      await supabase
        .from('profiles')
        .update({ status: profileStatus })
        .eq('id', currentMagang.siswa_id)

      await logActivity('Update Status', 'MAGANG', id, data)
    }

    return !error
  },

  inputNilai: async (id: string, nilai: number) => {
    const supabase = await createServerClient()
    
    const { error } = await supabase
      .from('magang')
      .update({
        nilai_akhir: nilai
      })
      .eq('id', id)

    if (!error) {
      await logActivity('Input Nilai', 'MAGANG', id, { nilai })
    }

    return !error
  }
}
