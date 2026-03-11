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

export type InternshipStats = {
  total: number
  aktif: number
  selesai: number
  dibatalkan: number
}

export type RecentMagang = {
  id: string
  // IDs for editing
  siswa_id?: string
  dudi_id?: string
  guru_id?: string | null
  
  // Display names
  namaSiswa: string
  dudi: string
  pembimbing: string
  startDate: string
  endDate: string
  status: 'aktif' | 'selesai' | 'dibatalkan' | 'menunggu' | string
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
  alamat?: string
  pembimbingId?: string | null
  dudiId?: string | null
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

export type UserProfileData = {
  id: string
  fullName: string
  email: string
  role: 'ADMIN' | 'GURU' | 'SISWA' | string
  isVerified: boolean
  createdAt: string
}

export type ActivityLog = {
  id: string
  userName: string
  action: string
  entityType: string
  details: string
  createdAt: string
}

export type ActivityStats = {
  total: number
  created: number
  updated: number
  deleted: number
}

export type SchoolSettings = {
  id: number
  npsn: string
  namaSekolah: string
  alamatSekolah: string
  telepon: string
  email: string
  website: string
  kepalaSekolah: string
  nipKepalaSekolah: string
  logoUrl: string
  headerSuratUrl: string
  updatedAt: string
}

export interface SiswaInput {
  nis: string
  nama: string
  kelas: string
  jurusan: string
  email: string
  nohp: string
  status: string
  alamat?: string
  guru_id?: string | null
  dudi_id?: string | null
}

export interface GuruInput {
  nip: string
  nama: string
  mataPelajaran: string
  email: string
  nohp: string
  status: string
  alamat?: string
}

export interface DudiInput {
  namaPerusahaan: string
  alamat: string
  penanggungJawab: string
  email: string
  noTelp: string
  status: boolean
}

export interface MagangInput {
  siswa_id: string
  guru_id?: string | null
  dudi_id: string
  tgl_mulai: string
  tgl_selesai: string
  status: string
}

