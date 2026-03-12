'use client'

import { 
  Settings, 
  Edit, 
  Save, 
  X, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Hash, 
  Layout, 
  FileText, 
  Printer, 
  Info,
  CheckCircle2,
  RefreshCw,
  Upload,
  AlertTriangle
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { SchoolSettings } from '@/types/admin'
import { api } from '@/lib/api'
import { uploadService } from '@/services/uploadService'
import { useSchoolSettings } from '@/components/providers/SchoolSettingsProvider'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'

export default function PengaturanSekolah() {
  const { refreshSettings } = useSchoolSettings()
  const [settings, setSettings] = useState<SchoolSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<SchoolSettings>>({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const data = await api.admin.getSettings()
        if (data.settings) {
          setSettings(data.settings)
          setFormData(data.settings)
        }
      } catch (error) {
        console.error("Failed to load settings:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const publicUrl = await uploadService.uploadFile(file, 'logos')
      if (publicUrl) {
        setFormData({ ...formData, logoUrl: publicUrl })
        setMessage({ type: 'success', text: 'Logo berhasil diunggah' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: 'Gagal mengunggah logo. Pastikan bucket "logos" sudah ada di Supabase.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat mengunggah' })
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const success = await api.admin.updateSettings(formData)
      if (success) {
        const newSettings = { ...settings, ...formData } as SchoolSettings
        setSettings(newSettings)
        setEditing(false)
        await refreshSettings() // Refresh global state (sidebar & header)
        setMessage({ type: 'success', text: 'Pengaturan berhasil diperbarui' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: 'Gagal memperbarui pengaturan' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan sistem' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] sm:text-[28px] font-bold text-slate-800 tracking-tight">Pengaturan Sekolah</h2>
          <p className="text-[13px] sm:text-[14px] text-slate-500 mt-1 font-medium italic sm:not-italic">Konfigurasi identitas instansi dan tampilan sistem secara global</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in zoom-in duration-300 ${
          message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <span className="text-[14px] font-bold">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 items-start">
        
        {/* Left Column: Form */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-none overflow-hidden">
            <div className="p-5 sm:p-6 lg:p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#00BCD4]/10 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-[#00BCD4]" />
                </div>
                <h3 className="text-[16px] sm:text-[18px] font-bold text-slate-800">Identitas Instansi</h3>
              </div>
              
              {!loading && (
                !editing ? (
                  <button 
                     onClick={() => setEditing(true)}
                    className="px-4 py-2 sm:px-5 sm:py-2.5 bg-[#00BCD4] text-white rounded-xl font-bold text-[12px] sm:text-[13px] flex items-center gap-2 hover:bg-[#00acc1] transition-all border border-[#00BCD4]/10 shadow-none"
                  >
                    <Edit className="w-4 h-4" />
                    Ubah
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { setEditing(false); setFormData(settings || {}); }}
                      className="px-4 py-2 sm:px-5 sm:py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-[12px] sm:text-[13px] flex items-center gap-2 hover:bg-slate-200 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      Batal
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 sm:px-5 sm:py-2.5 bg-[#00BCD4] text-white rounded-xl font-bold text-[12px] sm:text-[13px] flex items-center gap-2 hover:bg-[#00acc1] transition-all border border-[#00BCD4]/10 shadow-none disabled:opacity-50"
                    >
                      {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Simpan
                    </button>
                  </div>
                )
              )}
            </div>

            <div className="p-5 sm:p-6 lg:p-8 space-y-8">
              {loading ? (
                <div className="space-y-8">
                  <div className="flex gap-6 items-start">
                    <Skeleton className="w-24 h-24 rounded-2xl" />
                    <div className="flex-1 space-y-3 pt-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-10 w-full rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-4 pt-4 border-t border-slate-50">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3"><Skeleton className="h-4 w-28" /><Skeleton className="h-11 w-full rounded-xl" /></div>
                    <div className="space-y-3"><Skeleton className="h-4 w-28" /><Skeleton className="h-11 w-full rounded-xl" /></div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Logo Section */}
                  <div>
                    <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Layout className="w-3.5 h-3.5" /> Logo Sekolah
                    </label>
                    <div className="flex items-start gap-4 sm:gap-6">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden group relative transition-all hover:border-[#00BCD4]/50 shrink-0">
                        {formData.logoUrl ? (
                          <Image src={formData.logoUrl} alt="Logo" fill className="object-contain p-2" />
                        ) : (
                          <span className="text-[9px] font-bold text-slate-400">NO LOGO</span>
                        )}
                        {uploading && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <RefreshCw className="w-5 h-5 text-[#00BCD4] animate-spin" />
                          </div>
                        )}
                      </div>
                      {editing && (
                        <div className="flex-1 space-y-3 min-w-0">
                          <div className="flex flex-wrap gap-2">
                            <button 
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploading}
                              className="h-10 px-4 bg-white border border-slate-200 rounded-xl text-[12px] font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
                            >
                              <Upload className="w-3.5 h-3.5 text-[#00BCD4]" />
                              Unggah File
                            </button>
                            <input 
                              type="file" 
                              ref={fileInputRef}
                              hidden 
                              accept="image/*"
                              onChange={handleFileUpload}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <input 
                              type="text" 
                              placeholder="Atau tempel Link Logo URL (https://...)" 
                              className="w-full h-10 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/20 transition-all placeholder:text-slate-400"
                              value={formData.logoUrl || ''}
                              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                            />
                            <p className="text-[11px] text-slate-400 font-medium italic leading-tight">Format PNG/SVG transparan direkomendasikan.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Header Surat Section */}
                  <div>
                    <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5" /> Kop Surat Digital (Header Dokumen)
                    </label>
                    <div className="flex flex-col gap-4">
                      <div className="w-full h-24 sm:h-32 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden relative group transition-all hover:border-[#00BCD4]/50">
                        {formData.headerSuratUrl ? (
                          <Image src={formData.headerSuratUrl} alt="Kop Surat" fill className="object-contain" />
                        ) : (
                          <div className="text-center opacity-40">
                            <Printer className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400 mx-auto mb-2" />
                            <span className="text-[9px] font-bold text-slate-500 tracking-widest">NO PREVIEW KOP SURAT</span>
                          </div>
                        )}
                        {uploading && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <RefreshCw className="w-5 h-5 text-[#00BCD4] animate-spin" />
                          </div>
                        )}
                      </div>
                      {editing && (
                        <div className="flex flex-col md:flex-row gap-3">
                          <button 
                            onClick={() => {
                              const input = document.createElement('input')
                              input.type = 'file'
                              input.accept = 'image/*'
                              input.onchange = async (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0]
                                if (!file) return
                                try {
                                  setUploading(true)
                                  const url = await uploadService.uploadFile(file, 'logos')
                                  if (url) setFormData({ ...formData, headerSuratUrl: url })
                                } finally {
                                  setUploading(false)
                                }
                              }
                              input.click()
                            }}
                            disabled={uploading}
                            className="h-10 px-4 bg-white border border-slate-200 rounded-xl text-[12px] font-bold text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm md:w-auto w-full"
                          >
                            <Upload className="w-3.5 h-3.5 text-emerald-500" />
                            Ganti Kop
                          </button>
                          <input 
                            type="text" 
                            placeholder="Atau Link Kop Surat URL" 
                            className="flex-1 h-10 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/20 transition-all placeholder:text-slate-400"
                            value={formData.headerSuratUrl || ''}
                            onChange={(e) => setFormData({ ...formData, headerSuratUrl: e.target.value })}
                          />
                        </div>
                      )}
                      <p className="text-[11px] text-slate-400 font-medium italic">Kop surat ini akan digunakan otomatis pada sertifikat dan laporan resmi.</p>
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 pt-4 border-t border-slate-50">
                    <div className="md:col-span-2">
                      <label className="text-[13px] font-bold text-slate-600 mb-2 flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-[#00BCD4]" /> Nama Sekolah / Instansi
                      </label>
                      <input 
                        disabled={!editing}
                        type="text" 
                        className="w-full h-11 px-4 bg-slate-50/50 border border-slate-100 rounded-xl text-[14px] font-bold text-slate-800 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/20"
                        value={formData.namaSekolah || ''}
                        onChange={(e) => setFormData({ ...formData, namaSekolah: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[13px] font-bold text-slate-600 mb-2 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#00BCD4]" /> Alamat Lengkap
                      </label>
                      <textarea 
                        disabled={!editing}
                        rows={3}
                        className="w-full p-4 bg-slate-50/50 border border-slate-100 rounded-xl text-[14px] font-medium text-slate-800 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/20 resize-none"
                        value={formData.alamatSekolah || ''}
                        onChange={(e) => setFormData({ ...formData, alamatSekolah: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="text-[13px] font-bold text-slate-600 mb-2 flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#00BCD4]" /> Nomor Telepon / WA
                      </label>
                      <input 
                        disabled={!editing}
                        type="text" 
                        className="w-full h-11 px-4 bg-slate-50/50 border border-slate-100 rounded-xl text-[14px] font-medium text-slate-800 disabled:text-slate-500"
                        value={formData.telepon || ''}
                        onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="text-[13px] font-bold text-slate-600 mb-2 flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-[#00BCD4]" /> Email Instansi
                      </label>
                      <input 
                        disabled={!editing}
                        type="email" 
                        className="w-full h-11 px-4 bg-slate-50/50 border border-slate-100 rounded-xl text-[14px] font-medium text-slate-800 disabled:text-slate-500"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="text-[13px] font-bold text-slate-600 mb-2 flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#00BCD4]" /> Nama Kepala Sekolah
                      </label>
                      <input 
                        disabled={!editing}
                        type="text" 
                        className="w-full h-11 px-4 bg-slate-50/50 border border-slate-100 rounded-xl text-[14px] font-medium text-slate-800 disabled:text-slate-500"
                        value={formData.kepalaSekolah || ''}
                        onChange={(e) => setFormData({ ...formData, kepalaSekolah: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="text-[13px] font-bold text-slate-600 mb-2 flex items-center gap-2">
                        <Hash className="w-3.5 h-3.5 text-[#00BCD4]" /> NIP (Kepala Sekolah)
                      </label>
                      <input 
                        disabled={!editing}
                        type="text" 
                        placeholder="Contoh: 19800101..."
                        className="w-full h-11 px-4 bg-slate-50/50 border border-slate-100 rounded-xl text-[14px] font-medium text-slate-800 disabled:text-slate-500"
                        value={formData.nipKepalaSekolah || ''}
                        onChange={(e) => setFormData({ ...formData, nipKepalaSekolah: e.target.value })}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[13px] font-bold text-slate-600 mb-2 flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-[#00BCD4]" /> NPSN (Nomor Identitas Sekolah)
                      </label>
                      <input 
                        disabled={!editing}
                        type="text" 
                        className="w-full h-11 px-4 bg-slate-50/50 border border-slate-100 rounded-xl text-[14px] font-medium text-slate-800 disabled:text-slate-500"
                        value={formData.npsn || ''}
                        onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="px-5 sm:px-8 py-4 bg-slate-50/30 border-t border-slate-100/50">
              <p className="text-[11px] text-slate-400 font-medium font-mono">
                Sistem ID: #INST-{settings?.id ? String(settings.id).slice(-5).toUpperCase() : '---'} | Last Sync: {settings?.updatedAt ? new Date(settings.updatedAt).toLocaleString('id-ID') : 'Never'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Previews & Info */}
        <div className="space-y-6">
          {/* Dashboard Header Preview */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-none p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Layout className="w-3.5 h-3.5 text-blue-400" /> Header Dashboard
              </label>
            </div>
            {loading ? <Skeleton className="h-20 w-full rounded-2xl" /> : (
              <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 shrink-0 relative overflow-hidden">
                  <Image src={formData.logoUrl || '/logo-placeholder.png'} alt="Logo" width={40} height={40} className="object-contain" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[13px] font-bold text-slate-800 leading-tight truncate">{formData.namaSekolah || 'NAMA SEKOLAH'}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-bold tracking-tight uppercase">Platform Magang</p>
                </div>
              </div>
            )}
          </div>

          {/* Document Preview Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-none p-5 sm:p-6 space-y-4">
            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Printer className="w-3.5 h-3.5 text-emerald-400" /> Header Dokumen
            </label>
            {loading ? <Skeleton className="h-40 w-full rounded-2xl" /> : (
              <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                <div className="w-10 h-10 mb-3 relative">
                  <Image src={formData.logoUrl || '/logo-placeholder.png'} alt="Logo" width={40} height={40} className="object-contain" />
                </div>
                <h4 className="text-[13px] font-black text-slate-900 leading-none uppercase">{formData.namaSekolah || 'NAMA INSTANSI'}</h4>
                <p className="text-[8px] text-slate-500 mt-2 font-medium max-w-[180px] leading-tight italic">
                  {formData.alamatSekolah || 'Alamat Belum Diatur'}
                </p>
                <div className="w-full h-[1.5px] bg-slate-900 mt-3" />
                <div className="w-full h-[0.5px] bg-slate-900 mt-px" />
                <span className="text-[9px] font-bold tracking-[2px] mt-4 uppercase text-slate-400">Preview Sertifikat</span>
              </div>
            )}
          </div>

          {/* User Guide Card */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative group">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#00BCD4]/10 rounded-full blur-2xl group-hover:bg-[#00BCD4]/20 transition-all" />
             <div className="relative space-y-4">
               <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                 <Info className="w-5 h-5 text-[#00BCD4]" />
               </div>
               <div>
                  <h4 className="text-[15px] font-bold">Butuh Bantuan?</h4>
                  <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">Pastikan file logo memiliki background transparan (.png) untuk hasil terbaik pada mode gelap dan terang.</p>
               </div>
               <ul className="space-y-2 pt-2 border-t border-white/5">
                  <li className="flex items-center gap-2 text-[11px] font-medium text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00BCD4]" />
                    Maksimal ukuran file: 2MB
                  </li>
                  <li className="flex items-center gap-2 text-[11px] font-medium text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00BCD4]" />
                    Format yang didukung: PNG, SVG, JPG
                  </li>
               </ul>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
