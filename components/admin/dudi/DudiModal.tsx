'use client'

import { 
  X, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  RefreshCw
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { ActiveDudi } from '@/types/admin'
import { api } from '@/lib/api'

interface DudiModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  dudi?: ActiveDudi | null
}

export function DudiModal({ isOpen, onClose, onSuccess, dudi }: DudiModalProps) {
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    namaPerusahaan: '',
    alamat: '',
    penanggungJawab: '',
    email: '',
    noTelp: '',
    status: true
  })

  useEffect(() => {
    if (isOpen) {
      if (dudi) {
        setFormData({
          namaPerusahaan: dudi.namaPerusahaan,
          alamat: dudi.alamat,
          penanggungJawab: dudi.penanggungJawab,
          email: dudi.email === '-' ? '' : dudi.email,
          noTelp: dudi.noTelp === '-' ? '' : dudi.noTelp,
          status: dudi.status
        })
      } else {
        setFormData({
          namaPerusahaan: '',
          alamat: '',
          penanggungJawab: '',
          email: '',
          noTelp: '',
          status: true
        })
      }
    }
  }, [isOpen, dudi])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      let res
      if (dudi) {
        res = await api.admin.updateDudi(dudi.id, formData)
      } else {
        res = await api.admin.createDudi(formData)
      }

      if (res.success) {
        onSuccess()
        onClose()
      } else {
        alert("Gagal menyimpan data DUDI. Silakan cek konsol untuk detail error.")
      }
    } catch (err: unknown) {
      console.error('Failed to save DUDI:', err)
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
            <div className="w-12 h-12 rounded-2xl bg-[#00BCD4]/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[#00BCD4]" />
            </div>
            <div>
              <h3 className="text-[20px] font-bold text-slate-800 leading-tight">
                {dudi ? 'Edit Perusahaan' : 'Tambah Perusahaan'}
              </h3>
              <p className="text-[13px] text-slate-400 mt-1 font-medium">
                {dudi ? 'Perbarui informasi data DUDI' : 'Lengkapi formulir untuk menambah DUDI baru'}
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
            {/* Nama Perusahaan */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#00BCD4]" /> Nama Perusahaan
              </label>
              <input 
                required
                type="text"
                placeholder="Masukkan nama perusahaan"
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#00BCD4]/10 focus:border-[#00BCD4] transition-all"
                value={formData.namaPerusahaan}
                onChange={(e) => setFormData({ ...formData, namaPerusahaan: e.target.value })}
              />
            </div>

            {/* Penanggung Jawab */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-[#00BCD4]" /> Penanggung Jawab
              </label>
              <input 
                required
                type="text"
                placeholder="Nama pemimpin / pembimbing DUDI"
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#00BCD4]/10 focus:border-[#00BCD4] transition-all"
                value={formData.penanggungJawab}
                onChange={(e) => setFormData({ ...formData, penanggungJawab: e.target.value })}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#00BCD4]" /> Status Kerjasama
              </label>
              <select 
                required
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#00BCD4]/10 focus:border-[#00BCD4] transition-all appearance-none"
                value={formData.status ? 'aktif' : 'tidak-aktif'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value === 'aktif' })}
              >
                <option value="aktif">Aktif (Menerima Siswa)</option>
                <option value="tidak-aktif">Tutup / Tidak Aktif</option>
              </select>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#00BCD4]" /> Email (Opsional)
              </label>
              <input 
                type="email"
                placeholder="email@perusahaan.com"
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#00BCD4]/10 focus:border-[#00BCD4] transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Telepon */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#00BCD4]" /> No. Telepon Induk
              </label>
              <input 
                required
                type="tel"
                placeholder="08xxxxxxxxx / 021xxxx"
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#00BCD4]/10 focus:border-[#00BCD4] transition-all"
                value={formData.noTelp}
                onChange={(e) => setFormData({ ...formData, noTelp: e.target.value })}
              />
            </div>

            {/* Alamat */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[13px] font-bold text-slate-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00BCD4]" /> Alamat Lengkap
              </label>
              <textarea 
                required
                rows={3}
                placeholder="Masukkan alamat lengkap lokasi DUDI"
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
            {dudi ? 'Simpan Perubahan' : 'Tambah Perusahaan'}
          </button>
        </div>
      </div>
    </div>
  )
}
