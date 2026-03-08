export type AdminStats = {
  totalSiswa: number
  totalDudi: number
  siswaMagang: number
  logbookHariIni: number
}

export type RecentMagang = {
  id: string
  namaSiswa: string
  dudi: string
  startDate: string
  endDate: string
  status: 'Aktif' | 'Selesai' | 'Non-Aktif' | string
}

export type RecentLogbook = {
  id: string
  kegiatan: string
  tanggal: string
  kendala: string | null
  status: 'pending' | 'Disetujui' | 'Ditolak' | string
}

export type ActiveDudi = {
  id: string
  namaPerusahaan: string
  alamat: string
  noTelp: string
  jumlahSiswa: number
}

export type SiswaData = {
  nis: string
  nama: string
  kelas: string
  jurusan: string
  email: string
  nohp: string
  status: 'magang' | 'selesai' | 'aktif' | 'non-aktif'
  pembimbing: string
  dudi: string
}

export type GuruData = {
  nip: string
  nama: string
  mataPelajaran: string
  email: string
  nohp: string
  totalSiswa: number
  status: 'aktif' | 'non-aktif'
}
