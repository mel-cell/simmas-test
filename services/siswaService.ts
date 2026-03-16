import { createClient as createServerClient } from '@/lib/supabaseServer'
import { Logbook } from '@/types/admin'

export const siswaService = {
  getDashboardData: async (siswaId: string) => {
    const supabase = await createServerClient()
    // 1. Get Profile Detail (for NIS, Kelas, Jurusan)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', siswaId)
      .single()

    // 2. Get Internship Info - Ambil yang aktif dulu, kalau tidak ada baru ambil yang lain
    interface RawMagang {
      id: string;
      status: string;
      tgl_mulai: string;
      tgl_selesai: string;
      dudi: { nama_perusahaan: string, alamat: string } | { nama_perusahaan: string, alamat: string }[];
      guru: { full_name: string, no_telp: string } | { full_name: string, no_telp: string }[];
    }

    const { data: allMagang } = await (supabase
      .from('magang')
      .select(`
        id,
        status,
        tgl_mulai,
        tgl_selesai,
        dudi:dudi_id (nama_perusahaan, alamat),
        guru:guru_id (full_name, no_telp)
      `)
      .eq('siswa_id', siswaId) as unknown as Promise<{ data: RawMagang[] | null }>)

    let magangRaw: RawMagang | null = null
    if (allMagang && allMagang.length > 0) {
      // Prioritas: 'aktif' > 'menunggu' > yang lain
      magangRaw = allMagang.find(m => m.status === 'aktif') || 
                  allMagang.find(m => m.status === 'menunggu') || 
                  allMagang[0]
    }

    const magang = magangRaw ? {
      ...magangRaw,
      dudi: Array.isArray(magangRaw.dudi) ? magangRaw.dudi[0] : magangRaw.dudi,
      guru: Array.isArray(magangRaw.guru) ? magangRaw.guru[0] : magangRaw.guru
    } : null

    // 3. Get Journal Stats by magang_id
    const stats = {
      total: 0,
      disetujui: 0,
      pending: 0,
      ditolak: 0
    }
    
    let recentJournals: Logbook[] = []

    if (magang) {
      const { data: logbooks } = await supabase
        .from('logbooks')
        .select('*')
        .eq('magang_id', magang.id)

      if (logbooks) {
        stats.total = logbooks.length
        stats.disetujui = logbooks.filter(l => l.status === 'disetujui' || l.status === 'approved').length
        stats.pending = logbooks.filter(l => l.status === 'pending' || l.status === 'menunggu').length
        stats.ditolak = logbooks.filter(l => l.status === 'ditolak' || l.status === 'rejected').length
        
        // Map to frontend naming if needed (schema has tanggal, status pending/approved/etc)
        recentJournals = logbooks
          .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
          .slice(0, 5)
          .map(l => ({
            id: l.id,
            siswa_id: siswaId,
            tgl: l.tanggal, 
            kegiatan: l.kegiatan,
            status: l.status === 'pending' ? 'menunggu' : (l.status === 'approved' ? 'disetujui' : (l.status === 'rejected' ? 'ditolak' : l.status)),
            catatan_guru: l.catatan_guru,
            kendala: l.kendala,
            foto_url: l.gambar_url
          })) as Logbook[]
      }
    }

    return {
      profile,
      magang,
      stats,
      recentJournals
    }
  },

  getAllJournals: async (siswaId: string) => {
    const supabase = await createServerClient()
    // 1. Get Magang ID
    const { data: magang } = await supabase
      .from('magang')
      .select('id')
      .eq('siswa_id', siswaId)
      .maybeSingle()
    
    if (!magang) return []

    const { data, error } = await supabase
      .from('logbooks')
      .select('*')
      .eq('magang_id', magang.id)
      .order('tanggal', { ascending: false })
    
    if (error) return []
    return (data || []).map(l => ({
      id: l.id,
      siswa_id: siswaId,
      tgl: l.tanggal,
      kegiatan: l.kegiatan,
      status: l.status === 'pending' ? 'menunggu' : (l.status === 'approved' ? 'disetujui' : (l.status === 'rejected' ? 'ditolak' : l.status)),
      catatan_guru: l.catatan_guru,
      kendala: l.kendala,
      foto_url: l.gambar_url
    })) as Logbook[]
  },

  getJournalDetail: async (id: string, siswaId: string) => {
    const supabase = await createServerClient()
    const { data: magang } = await supabase
      .from('magang')
      .select('id')
      .eq('siswa_id', siswaId)
      .maybeSingle()

    if (!magang) return null

    const { data, error } = await supabase
      .from('logbooks')
      .select('*')
      .eq('id', id)
      .eq('magang_id', magang.id)
      .single()
    
    if (error) return null
    return {
      ...data,
      tgl: data.tanggal,
      status: data.status === 'pending' ? 'menunggu' : (data.status === 'approved' ? 'disetujui' : (data.status === 'rejected' ? 'ditolak' : data.status)),
      foto_url: data.gambar_url
    }
  },

  createJournal: async (data: { 
    siswa_id: string, 
    tgl: string, 
    kegiatan: string, 
    kendala?: string,
    foto_url?: string,
    status?: 'draft' | 'menunggu'
  }) => {
    const supabase = await createServerClient()
    // 1. Find Magang ID
    const { data: magang } = await supabase
      .from('magang')
      .select('id, status, tgl_mulai, tgl_selesai')
      .eq('siswa_id', data.siswa_id)
      .eq('status', 'aktif')
      .maybeSingle() as unknown as { data: { id: string, status: string, tgl_mulai: string, tgl_selesai: string } | null }
    
    if (!magang) throw new Error('Anda tidak dapat membuat jurnal karena belum memiliki program magang yang aktif.')

    // 1.2. Check date range
    const journalDate = new Date(data.tgl)
    if (magang.tgl_mulai && journalDate < new Date(magang.tgl_mulai)) {
       throw new Error(`Tanggal jurnal tidak boleh sebelum tanggal mulai magang (${magang.tgl_mulai}).`)
    }
    if (magang.tgl_selesai && journalDate > new Date(magang.tgl_selesai)) {
       throw new Error(`Tanggal jurnal tidak boleh setelah tanggal selesai magang (${magang.tgl_selesai}).`)
    }

    if (data.kegiatan.trim().length < 50) {
      throw new Error('Deskripsi kegiatan minimal 50 karakter.')
    }

    // 1.5. Prevent Future Dates
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    if (new Date(data.tgl) > today) {
      throw new Error('Tidak dapat mengisi jurnal untuk tanggal di masa depan.')
    }

    // 2. Check for existing entry on same date
    const { data: existing } = await supabase
      .from('logbooks')
      .select('id')
      .eq('magang_id', magang.id)
      .eq('tanggal', data.tgl)
      .maybeSingle()

    if (existing) {
      throw new Error('Jurnal untuk tanggal ini sudah ada. Silakan edit jurnal yang sudah ada.')
    }

    const { error } = await supabase
      .from('logbooks')
      .insert({
        magang_id: magang.id,
        tanggal: data.tgl,
        kegiatan: data.kegiatan,
        kendala: data.kendala,
        gambar_url: data.foto_url,
        status: data.status === 'draft' ? 'draft' : 'pending' 
      })
    
    return !error
  },

  updateJournal: async (id: string, siswaId: string, data: {
    kegiatan?: string,
    kendala?: string,
    foto_url?: string,
    status?: 'draft' | 'menunggu'
  }) => {
    const supabase = await createServerClient()

    // 0. Verify owner
    const { data: current } = await supabase
      .from('logbooks')
      .select('*, magang!inner(siswa_id)')
      .eq('id', id)
      .single() as unknown as { data: { status: string, magang: { siswa_id: string } } | null }

    if (!current || current.magang.siswa_id !== siswaId) {
      throw new Error('Unauthorized or Journal not found')
    }

    // 1. Check current status
    if (current.status === 'disetujui' || current.status === 'approved') {
      throw new Error('Jurnal yang sudah disetujui tidak dapat diubah.')
    }

    if (data.kegiatan && data.kegiatan.trim().length < 50) {
      throw new Error('Deskripsi kegiatan minimal 50 karakter.')
    }

    // 2. Map status to DB
    let targetStatus: string | undefined = data.status
    if (!targetStatus && (current?.status === 'ditolak' || current?.status === 'rejected')) {
      targetStatus = 'pending'
    } else if (targetStatus === 'menunggu') {
      targetStatus = 'pending'
    }

    const { error } = await supabase
      .from('logbooks')
      .update({
        kegiatan: data.kegiatan,
        kendala: data.kendala,
        gambar_url: data.foto_url,
        status: targetStatus || current?.status,
        ...(targetStatus === 'pending' || targetStatus === 'draft' ? { catatan_guru: null, approved_by: null, approved_at: null } : {})
      })
      .eq('id', id)

    return !error
  },

  deleteJournal: async (id: string, siswaId: string) => {
    const supabase = await createServerClient()
    
    // 0. Verify owner
    const { data: current } = await supabase
      .from('logbooks')
      .select('status, magang!inner(siswa_id)')
      .eq('id', id)
      .single() as unknown as { data: { status: string, magang: { siswa_id: string } } | null }

    if (!current || current.magang.siswa_id !== siswaId) {
      throw new Error('Unauthorized or Journal not found')
    }

    if (current.status === 'disetujui' || current.status === 'approved') {
      throw new Error('Jurnal yang sudah disetujui tidak dapat dihapus.')
    }

    const { error } = await supabase
      .from('logbooks')
      .delete()
      .eq('id', id)

    return !error
  },

  getAvailableDudis: async () => {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('dudi')
      .select('*')
      .eq('is_active', true)
      .order('nama_perusahaan', { ascending: true })
    
    if (error) return []
    return data || []
  },

  getInternshipApplications: async (siswaId: string) => {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('magang')
      .select(`
        *,
        dudi:dudi_id (nama_perusahaan, alamat, no_telp, email)
      `)
      .eq('siswa_id', siswaId)
      .order('created_at', { ascending: false })
    
    if (error) return []
    return data || []
  },

  applyForInternship: async (siswaId: string, dudiId: string, guruId?: string) => {
    const supabase = await createServerClient()
    // 1. Check if already has 3 pending applications
    const { count } = await supabase
      .from('magang')
      .select('*', { count: 'exact', head: true })
      .eq('siswa_id', siswaId)
      .eq('status', 'menunggu')
    
    if (count && count >= 3) {
      throw new Error('Anda sudah mencapai batas maksimal 3 pendaftaran pending.')
    }

    // 2. Check if already has an active internship
    const { data: active } = await supabase
      .from('magang')
      .select('id')
      .eq('siswa_id', siswaId)
      .eq('status', 'aktif')
      .maybeSingle()
    
    if (active) {
      throw new Error('Anda sudah terdaftar dalam program magang aktif.')
    }

    // 3. Check DUDI quota
    const { data: dudi } = await supabase
      .from('dudi')
      .select('kuota_maksimal')
      .eq('id', dudiId)
      .maybeSingle()

    if (dudi && dudi.kuota_maksimal) {
      const { count: acceptedSiswa } = await supabase
        .from('magang')
        .select('*', { count: 'exact', head: true })
        .eq('dudi_id', dudiId)
        .eq('status', 'aktif')

      if (acceptedSiswa !== null && acceptedSiswa >= dudi.kuota_maksimal) {
        throw new Error('Kuota di tempat magang ini sudah penuh.')
      }
    }

    // 4. Apply
    const { error } = await supabase
      .from('magang')
      .insert({
        siswa_id: siswaId,
        dudi_id: dudiId,
        guru_id: guruId || null,
        status: 'menunggu'
      })
    
    return !error
  },

  getAvailableTeachers: async () => {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, nomor_induk, jurusan, email')
      .eq('role', 'GURU')
      .eq('status', 'aktif')
      .order('full_name', { ascending: true })
    
    if (error) return []
    return data || []
  }
}
