import { SiswaJournal } from './siswa'

export interface GuruStats {
  totalSiswa: number
  siswaMagang: number
  logbookHariIni: number
  pendingApproval?: number
  rataRataNilai?: number
}

export interface BimbinganSiswa {
  id: string // magang_id
  siswa_id: string
  siswa: {
    full_name: string
    nomor_induk: string
    kelas: string
    jurusan: string
  }
  dudi: {
    id: string
    nama_perusahaan: string
    alamat: string
  }
  tgl_mulai: string
  tgl_selesai: string
  status: 'aktif' | 'selesai' | 'menunggu' | 'dibatalkan' | string
  nilai?: number
  catatan?: string
}

export interface GuruDashboardResponse {
  stats: GuruStats
  recentMagang: BimbinganSiswa[]
  recentLogbooks: GuruJournalApproval[]
}

export interface GuruJournalApproval extends SiswaJournal {
  siswa: {
    full_name: string
    nomor_induk: string
    kelas: string
    jurusan: string
  }
  dudi: {
    nama_perusahaan: string
    alamat: string
    pic?: string
  }
}
