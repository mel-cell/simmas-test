'use client'

import { 
  X, 
  Briefcase, 
  User, 
  Building2, 
  GraduationCap, 
  Calendar, 
  RefreshCw 
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { RecentMagang } from '@/types/admin'
import { api } from '@/lib/api'

interface MagangModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  internship?: RecentMagang | null
}

export function MagangModal({ isOpen, onClose, onSuccess, internship }: MagangModalProps) {
  const [loading, setLoading] = useState(false)
  const [siswaOptions, setSiswaOptions] = useState<{ id: string, nama: string }[]>([])
  const [guruOptions, setGuruOptions] = useState<{ id: string, nama: string }[]>([])
  const [dudiOptions, setDudiOptions] = useState<{ id: string, name: string }[]>([])

  const [formData, setFormData] = useState({
    siswa_id: '',
    guru_id: '',
    dudi_id: '',
    tgl_mulai: '',
    tgl_selesai: '',
    status: 'menunggu',
    catatan: ''
  })

  // Load dropdown options
  useEffect(() => {
    async function fetchOptions() {
      try {
        const [siswaRes, guruRes, dudiRes] = await Promise.all([
          api.admin.getSiswaOptions(),
          api.admin.getTeacherOptions(),
          api.admin.getDudiOptions()
        ])
        setSiswaOptions(siswaRes || [])
        setGuruOptions(guruRes || [])
        setDudiOptions(dudiRes || [])
      } catch (error) {
        console.error("Failed to fetch options:", error)
      }
    }
    if (isOpen) {
      fetchOptions()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      if (internship) {
        setFormData({
          siswa_id: internship.siswa_id || '',
          guru_id: internship.guru_id || '',
          dudi_id: internship.dudi_id || '',
          tgl_mulai: internship.startDate && internship.startDate !== '-' ? internship.startDate : '',
          tgl_selesai: internship.endDate && internship.endDate !== '-' ? internship.endDate : '',
          status: internship.status || 'menunggu',
          catatan: internship.catatan || ''
        })
      } else {
        setFormData({
          siswa_id: '',
          guru_id: '',
          dudi_id: '',
          tgl_mulai: '',
          tgl_selesai: '',
          status: 'aktif',
          catatan: ''
        })
      }
    }
  }, [isOpen, internship])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      let res
      if (internship) {
        res = await api.admin.updateInternship(internship.id, formData)
      } else {
        res = await api.admin.createInternship(formData)
      }

      if (res.success) {
        onSuccess()
        onClose()
      } else {
        alert(res.error || "Gagal menyimpan data magang. Silakan cek konsol untuk detail error.")
      }
    } catch (err: unknown) {
      console.error('Failed to save internship:', err)
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
              <Briefcase className="w-6 h-6 text-[#2563EB]" />
            </div>
            <div>
              <h3 className="text-[20px] font-medium text-slate-800 leading-tight">
                {internship ? 'Edit Penempatan Magang' : 'Tambah Magang Baru'}
              </h3>
              <p className="text-[13px] text-slate-400 mt-1 font-medium">
                {internship ? 'Perbarui informasi penempatan magang siswa' : 'Lengkapi formulir untuk menempatkan magang siswa'}
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
            
            {/* Siswa */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[13px] font-medium text-slate-700 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#2563EB]" /> Siswa
              </label>
              <select 
                required
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all appearance-none"
                value={formData.siswa_id}
                onChange={(e) => setFormData({ ...formData, siswa_id: e.target.value })}
              >
                <option value="" disabled>Pilih Siswa</option>
                {siswaOptions.map((s) => (
                  <option key={s.id} value={s.id}>{s.nama}</option>
                ))}
              </select>
            </div>

            {/* DUDI */}
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-slate-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#2563EB]" /> DUDI (Perusahaan)
              </label>
              <select 
                required
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all appearance-none"
                value={formData.dudi_id}
                onChange={(e) => setFormData({ ...formData, dudi_id: e.target.value })}
              >
                <option value="" disabled>Pilih DUDI</option>
                {dudiOptions.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Guru Pembimbing */}
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-[#2563EB]" /> Guru Pembimbing
              </label>
              <select 
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all appearance-none"
                value={formData.guru_id}
                onChange={(e) => setFormData({ ...formData, guru_id: e.target.value })}
              >
                <option value="">Belum Memiliki Pembimbing (Kosongkan)</option>
                {guruOptions.map((g) => (
                  <option key={g.id} value={g.id}>{g.nama}</option>
                ))}
              </select>
            </div>

            {/* Tanggal Mulai */}
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2563EB]" /> Tanggal Mulai
              </label>
              <input 
                required
                type="date"
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                value={formData.tgl_mulai}
                onChange={(e) => setFormData({ ...formData, tgl_mulai: e.target.value })}
              />
            </div>

            {/* Tanggal Selesai */}
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2563EB]" /> Tanggal Selesai
              </label>
              <input 
                required
                type="date"
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                value={formData.tgl_selesai}
                onChange={(e) => setFormData({ ...formData, tgl_selesai: e.target.value })}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-slate-700 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#2563EB]" /> Status Magang
              </label>
              <select 
                required
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all appearance-none"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="menunggu">Menunggu</option>
                <option value="aktif">Aktif</option>
                <option value="selesai">Selesai</option>
                <option value="dibatalkan">Dibatalkan</option>
              </select>
            </div>

            {/* Catatan */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[13px] font-medium text-slate-700 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#2563EB]" /> Catatan Tambahan
              </label>
              <textarea 
                rows={3}
                placeholder="Catatan tambahan (opsional)..."
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[24px] text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all resize-none"
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              />
            </div>

          </div>
        </form>

        {/* Footer */}
        <div className="p-6 sm:p-8 bg-slate-50/50 border-t border-slate-50 flex items-center justify-end gap-3 shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-white text-slate-600 rounded-2xl font-medium text-[14px] hover:bg-slate-100 transition-all border border-slate-200"
          >
            Batal
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 bg-[#2563EB] text-white rounded-2xl font-medium text-[14px] hover:bg-[#1d4ed8] transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            {internship ? 'Simpan Perubahan' : 'Tambah Magang'}
          </button>
        </div>
      </div>
    </div>
  )
}
