'use client'

import { 
  X, 
  User, 
  Hash, 
  BookOpen, 
  GraduationCap, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  UserCheck,
  RefreshCw
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { SiswaData } from '@/types/admin'
import { api } from '@/lib/api'

interface SiswaModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  siswa?: SiswaData | null
}

export function SiswaModal({ isOpen, onClose, onSuccess, siswa }: SiswaModalProps) {
  const [loading, setLoading] = useState(false)
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [teachers, setTeachers] = useState<{ id: string, nama: string }[]>([])
  const [dudis, setDudis] = useState<{ id: string, name: string }[]>([])
  
  const [formData, setFormData] = useState({
    nis: '',
    nama: '',
    kelas: '',
    jurusan: '',
    email: '',
    nohp: '',
    alamat: '',
    status: 'aktif',
    guru_id: '',
    dudi_id: ''
  })

  useEffect(() => {
    if (isOpen) {
      loadOptions()
      if (siswa) {
        setFormData({
          nis: siswa.nis,
          nama: siswa.nama,
          kelas: siswa.kelas,
          jurusan: siswa.jurusan,
          email: siswa.email,
          nohp: siswa.nohp,
          alamat: '', // We didn't fetch address in list, but let's keep it empty for now
          status: siswa.status,
          guru_id: siswa.pembimbingId || '',
          dudi_id: siswa.dudiId || ''
        })
      } else {
        setFormData({
          nis: '',
          nama: '',
          kelas: '',
          jurusan: '',
          email: '',
          nohp: '',
          alamat: '',
          status: 'aktif',
          guru_id: '',
          dudi_id: ''
        })
      }
    }
  }, [isOpen, siswa])

  async function loadOptions() {
    try {
      setOptionsLoading(true)
      const [teacherOpts, dudiOpts] = await Promise.all([
        api.admin.getTeacherOptions(),
        api.admin.getDudiOptions()
      ])
      setTeachers(teacherOpts)
      setDudis(dudiOpts)
    } finally {
      setOptionsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      let res
      if (siswa) {
        res = await api.admin.updateStudent(siswa.id, formData)
      } else {
        res = await api.admin.createStudent(formData)
      }

      if (res.success) {
        onSuccess()
        onClose()
      } else {
        alert("Gagal menyimpan data siswa. Silakan cek konsol untuk detail error.")
      }
    } catch (err: unknown) {
      console.error('Failed to save student:', err)
      const errorMsg = err instanceof Error ? err.message : "Gagal menghubungi server"
      alert("Terjadi kesalahan: " + errorMsg)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00BCD4]/10 flex items-center justify-center">
              <User className="w-6 h-6 text-[#00BCD4]" />
            </div>
            <div>
              <h3 className="text-[20px] font-bold text-slate-800 leading-tight">
                {siswa ? 'Edit Siswa' : 'Tambah Siswa'}
              </h3>
              <p className="text-[13px] text-slate-400 mt-1 font-medium">
                {siswa ? 'Perbarui informasi data siswa pilihan' : 'Lengkapi formulir untuk menambah siswa baru'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* NIS */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#00BCD4]" /> NIS
              </label>
              <input 
                required
                type="text"
                placeholder="Masukkan NIS"
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#00BCD4]/10 focus:border-[#00BCD4] transition-all"
                value={formData.nis}
                onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
              />
            </div>

            {/* Nama Lengkap */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-[#00BCD4]" /> Nama Lengkap
              </label>
              <input 
                required
                type="text"
                placeholder="Masukkan nama lengkap"
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#00BCD4]/10 focus:border-[#00BCD4] transition-all"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />
            </div>

            {/* Kelas */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#00BCD4]" /> Kelas
              </label>
              <select 
                required
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#00BCD4]/10 focus:border-[#00BCD4] transition-all appearance-none"
                value={formData.kelas}
                onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
              >
                <option value="">Pilih Kelas</option>
                <option value="X">Kelas X</option>
                <option value="XI">Kelas XI</option>
                <option value="XII">Kelas XII</option>
              </select>
            </div>

            {/* Jurusan */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#00BCD4]" /> Jurusan
              </label>
              <select 
                required
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#00BCD4]/10 focus:border-[#00BCD4] transition-all appearance-none"
                value={formData.jurusan}
                onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
              >
                <option value="">Pilih Jurusan</option>
                <option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak</option>
                <option value="Teknik Komputer Jaringan">Teknik Komputer Jaringan</option>
                <option value="Multimedia">Multimedia</option>
              </select>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#00BCD4]" /> Email
              </label>
              <input 
                required
                type="email"
                placeholder="email@example.com"
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#00BCD4]/10 focus:border-[#00BCD4] transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Telepon */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#00BCD4]" /> Telepon
              </label>
              <input 
                required
                type="tel"
                placeholder="08xxxxxxxxx"
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#00BCD4]/10 focus:border-[#00BCD4] transition-all"
                value={formData.nohp}
                onChange={(e) => setFormData({ ...formData, nohp: e.target.value })}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#00BCD4]" /> Status
              </label>
              <select 
                required
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#00BCD4]/10 focus:border-[#00BCD4] transition-all appearance-none"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="aktif">Aktif</option>
                <option value="magang">Sedang Magang</option>
                <option value="selesai">Selesai</option>
                <option value="non-aktif">Non-Aktif</option>
              </select>
            </div>

            {/* Guru Pembimbing */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#00BCD4]" /> Guru Pembimbing (opsional)
              </label>
              <select 
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#00BCD4]/10 focus:border-[#00BCD4] transition-all appearance-none"
                value={formData.guru_id}
                onChange={(e) => setFormData({ ...formData, guru_id: e.target.value })}
                disabled={optionsLoading}
              >
                <option value="">Belum ada</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.nama}</option>
                ))}
              </select>
            </div>

            {/* DUDI */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#00BCD4]" /> DUDI (opsional)
              </label>
              <select 
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#00BCD4]/10 focus:border-[#00BCD4] transition-all appearance-none"
                value={formData.dudi_id}
                onChange={(e) => setFormData({ ...formData, dudi_id: e.target.value })}
                disabled={optionsLoading}
              >
                <option value="">Belum ada</option>
                {dudis.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Alamat */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00BCD4]" /> Alamat
              </label>
              <textarea 
                rows={3}
                placeholder="Masukkan alamat lengkap"
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[24px] text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#00BCD4]/10 focus:border-[#00BCD4] transition-all resize-none"
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 sm:p-8 bg-slate-50/50 border-t border-slate-50 flex items-center justify-end gap-3 shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-white text-slate-600 rounded-2xl font-bold text-[14px] hover:bg-slate-100 transition-all border border-slate-200"
          >
            Batal
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 bg-[#00BCD4] text-white rounded-2xl font-bold text-[14px] hover:bg-[#00acc1] transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            {siswa ? 'Simpan Perubahan' : 'Tambah Siswa'}
          </button>
        </div>
      </div>
    </div>
  )
}
