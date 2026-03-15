'use client'

import { 
  X, 
  User, 
  Hash, 
  BookOpen, 
  Mail, 
  Phone, 
  MapPin, 
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { GuruData } from '@/types/admin'
import { api } from '@/lib/api'

interface GuruModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  guru?: GuruData | null
}

export function GuruModal({ isOpen, onClose, onSuccess, guru }: GuruModalProps) {
  const [loading, setLoading] = useState(false)
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  
  const [formData, setFormData] = useState({
    nip: '',
    nama: '',
    mataPelajaran: '',
    email: '',
    nohp: '',
    alamat: '',
    status: 'aktif',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (isOpen) {
      if (guru) {
        setFormData({
          nip: guru.nip,
          nama: guru.nama,
          mataPelajaran: guru.mataPelajaran === 'Tidak Diatur' ? '' : guru.mataPelajaran,
          email: guru.email,
          nohp: guru.nohp,
          alamat: (guru as GuruData & { alamat?: string }).alamat || '',
          status: guru.status,
          password: '',
          confirmPassword: ''
        })
      } else {
        setFormData({
          nip: '',
          nama: '',
          mataPelajaran: '',
          email: '',
          nohp: '',
          alamat: '',
          status: 'aktif',
          password: '',
          confirmPassword: ''
        })
      }
      setPasswordError('')
    }
  }, [isOpen, guru])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!guru && !formData.password) {
      setPasswordError('Password harus diisi untuk guru baru')
      return
    }
    if (formData.password && formData.password.length < 6) {
      setPasswordError('Password minimal 6 karakter')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Konfirmasi password tidak cocok')
      return
    }

    try {
      setLoading(true)
      let res
      
      const payload = {
        ...formData,
        nip: formData.nip.trim(),
        nama: formData.nama.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password || undefined
      }

      if (guru) {
        res = await api.admin.updateTeacher(guru.id, payload)
      } else {
        res = await api.admin.createTeacher(payload)
      }

      if (res.success) {
        onSuccess()
        onClose()
      } else {
        alert(res.error || "Gagal menyimpan data guru. Silakan cek konsol untuk detail error.")
      }
    } catch (err: unknown) {
      console.error('Failed to save teacher:', err)
      const errorMsg = err instanceof Error ? err.message : "Gagal menghubungi server"
      alert("Terjadi kesalahan: " + errorMsg)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
            <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center">
              <User className="w-6 h-6 text-[#2563EB]" />
            </div>
            <div>
              <h3 className="text-[20px] font-bold text-slate-800 leading-tight">
                {guru ? 'Edit Guru' : 'Tambah Guru'}
              </h3>
              <p className="text-[13px] text-slate-400 mt-1 font-medium">
                {guru ? 'Perbarui informasi data guru' : 'Lengkapi formulir untuk menambah guru baru'}
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
            {/* NIP */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#2563EB]" /> NIP
              </label>
              <input 
                required
                type="text"
                placeholder="Masukkan NIP"
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
              />
            </div>

            {/* Nama Lengkap */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-[#2563EB]" /> Nama Lengkap
              </label>
              <input 
                required
                type="text"
                placeholder="Masukkan nama lengkap"
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#2563EB]" /> Email
              </label>
              <input 
                required
                type="email"
                placeholder="email@example.com"
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Telepon */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#2563EB]" /> Telepon
              </label>
              <input 
                required
                type="tel"
                placeholder="08xxxxxxxxx"
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                value={formData.nohp}
                onChange={(e) => setFormData({ ...formData, nohp: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#2563EB]" /> Mata Pelajaran / Jurusan
              </label>
              <select 
                required
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all appearance-none"
                value={formData.mataPelajaran}
                onChange={(e) => setFormData({ ...formData, mataPelajaran: e.target.value })}
              >
                <option value="">Pilih Mata Pelajaran/Jurusan</option>
                <option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak</option>
                <option value="Teknik Komputer Jaringan">Teknik Komputer Jaringan</option>
                <option value="Multimedia">Multimedia</option>
                <option value="Desain Komunikasi Visual">Desain Komunikasi Visual</option>
                <option value="Teknik Otomasi Industri">Teknik Otomasi Industri</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#2563EB]" /> Status
              </label>
              <select 
                required
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all appearance-none"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="aktif">Aktif</option>
                <option value="non-aktif">Non-Aktif</option>
              </select>
            </div>

            {/* Alamat */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2563EB]" /> Alamat
              </label>
              <textarea 
                rows={3}
                placeholder="Masukkan alamat lengkap"
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[24px] text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all resize-none"
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              />
            </div>

             {/* Password Fields */}
            <div className="space-y-2 relative">
                <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                   <div className="w-4 h-4 text-[#2563EB] flex items-center justify-center font-bold">***</div> Password {guru ? '(Opsional)' : <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                    <input 
                        type={showPassword ? 'text' : 'password'}
                        placeholder={guru ? "Kosongkan jika tidak diubah" : "Masukkan password"}
                        className="w-full h-12 px-5 pr-12 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff className="w-5 h-5 truncate" /> : <Eye className="w-5 h-5 truncate" />}
                    </button>
                </div>
            </div>

            <div className="space-y-2 relative">
                <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                   <div className="w-4 h-4 text-[#2563EB] flex items-center justify-center font-bold">***</div> Konfirmasi Password
                </label>
                <div className="relative">
                    <input 
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Ulangi password"
                        className="w-full h-12 px-5 pr-12 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                    <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5 truncate" /> : <Eye className="w-5 h-5 truncate" />}
                    </button>
                </div>
                {passwordError && (
                    <p className="text-[11px] text-red-500 mt-1 font-bold pl-1">{passwordError}</p>
                )}
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
            className="px-8 py-3 bg-[#2563EB] text-white rounded-2xl font-bold text-[14px] hover:bg-[#1d4ed8] transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            {guru ? 'Simpan Perubahan' : 'Tambah Guru'}
          </button>
        </div>
      </div>
    </div>
  )
}
