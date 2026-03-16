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
        siswa:siswa_id (full_name, nomor_induk, kelas, jurusan),
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

  updateMagangStatus: async (id: string, guruId: string, data: { status: string, tgl_mulai?: string, tgl_selesai?: string, catatan?: string }) => {
    const supabase = await createServerClient()
    
    // 1. Get student ID and DUDI current context
    const { data: currentMagang } = await supabase
      .from('magang')
      .select('siswa_id, dudi_id, status')
      .eq('id', id)
      .single()

    // 2. Check DUDI Quota if transitioning to 'aktif'
    if (data.status === 'aktif' && currentMagang?.status !== 'aktif' && currentMagang?.dudi_id) {
      const { data: dudi } = await supabase
        .from('dudi')
        .select('kuota_maksimal')
        .eq('id', currentMagang.dudi_id)
        .maybeSingle()

      if (dudi && dudi.kuota_maksimal) {
        const { count: acceptedSiswa } = await supabase
          .from('magang')
          .select('*', { count: 'exact', head: true })
          .eq('dudi_id', currentMagang.dudi_id)
          .eq('status', 'aktif')

        if (acceptedSiswa !== null && acceptedSiswa >= dudi.kuota_maksimal) {
          throw new Error('Persetujuan dibatalkan. Kuota penempatan di perusahaan (DUDI) ini sudah penuh.')
        }
      }
    }

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

      await logActivity('Update Status', 'MAGANG', id, data, guruId)
    }

    return !error
  },

  inputNilai: async (id: string, guruId: string, nilai: number) => {
    if (nilai < 0 || nilai > 100) {
      throw new Error('Nilai harus antara 0 - 100');
    }

    const supabase = await createServerClient()
    
    // 0. Verify owner
    const { data: current } = await supabase
      .from('magang')
      .select('guru_id')
      .eq('id', id)
      .single()

    if (!current || current.guru_id !== guruId) {
      throw new Error('Unauthorized: Anda bukan pembimbing untuk siswa ini.')
    }

    const { error } = await supabase
      .from('magang')
      .update({
        nilai_akhir: nilai
      })
      .eq('id', id)

    if (!error) {
      await logActivity('Input Nilai', 'MAGANG', id, { nilai }, guruId)
    }

    return !error
  }
}
