export interface SiswaProfile {
  id: string
  full_name: string
  email: string
  nomor_induk: string
  kelas: string
  jurusan: string
  no_telp?: string
  alamat?: string
  avatar_url?: string
  status?: string
}

export interface SiswaDudi {
  id: string
  nama_perusahaan: string
  alamat: string
  no_telp?: string
  email?: string
}

export interface SiswaMagang {
  id: string
  status: 'aktif' | 'menunggu' | 'selesai' | 'ditolak' | string
  tgl_mulai: string
  tgl_selesai: string
  dudi: {
    nama_perusahaan: string
    alamat: string
  }
  guru: {
    full_name: string
    no_telp: string
  }
}

export interface SiswaApplication {
  id: string
  status: string
  created_at: string
  dudi: SiswaDudi
}

export interface SiswaJournal {
  id: string
  tgl: string
  kegiatan: string
  kendala?: string
  status: 'draft' | 'menunggu' | 'disetujui' | 'ditolak'
  catatan_guru?: string
  foto_url?: string
}

export interface SiswaDashboardResponse {
  profile: SiswaProfile | null
  magang: SiswaMagang | null
  stats: {
    total: number
    disetujui: number
    pending: number
    ditolak: number
  }
  recentJournals: SiswaJournal[]
}
