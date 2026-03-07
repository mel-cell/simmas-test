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
  status: 'Aktif' | 'Selesai' | 'Non-Aktif'
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
