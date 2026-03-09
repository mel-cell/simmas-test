export type AdminStats = {
  totalSiswa: number
  totalDudi: number
  siswaMagang: number
  logbookHariIni: number
}

export type StudentStats = {
  total: number
  sedangMagang: number
  selesaiMagang: number
  belumAdaPembimbing: number
}

export type TeacherStats = {
  total: number
  aktif: number
  totalBimbingan: number
  rataRataSiswa: number
}

export type DudiStats = {
  total: number
  aktif: number
  tidakAktif: number
  totalSiswaMagang: number
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
  email: string
  noTelp: string
  penanggungJawab: string
  jumlahSiswa: number
  status: boolean
}

export type SiswaData = {
  id: string
  nis: string
  nama: string
  kelas: string
  jurusan: string
  email: string
  nohp: string
  status: 'magang' | 'selesai' | 'aktif' | 'non-aktif' | string
  pembimbing: string
  dudi: string
}

export type GuruData = {
  id: string
  nip: string
  nama: string
  mataPelajaran: string
  email: string
  nohp: string
  totalSiswa: number
  status: 'aktif' | 'non-aktif' | string
}
