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
  Globe, 
  User, 
  Hash, 
  Layout, 
  FileText, 
  Printer, 
  Info,
  CheckCircle2,
  RefreshCw,
  Upload
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { SchoolSettings } from '@/types/admin'
import { api } from '@/lib/api'
import { adminService } from '@/services/adminService'

export default function PengaturanSekolah() {
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
      const publicUrl = await adminService.uploadFile(file, 'logos')
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
        setSettings({ ...settings, ...formData } as SchoolSettings)
        setEditing(false)
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

  if (loading) return <div className="p-10 text-center text-slate-400 font-medium">Memuat pengaturan...</div>

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-bold text-slate-800 tracking-tight">Pengaturan Sekolah</h2>
          <p className="text-[14px] text-slate-500 mt-1 font-medium">Konfigurasi identitas instansi dan tampilan sistem</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in zoom-in duration-300 ${
          message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Info className="w-5 h-5" />}
          <span className="text-[14px] font-bold">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 items-start">
        
        {/* Left Column: Form */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="p-6 lg:p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#00BCD4]/10 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-[#00BCD4]" />
                </div>
                <h3 className="text-[18px] font-bold text-slate-800">Informasi Sekolah</h3>
              </div>
              
              {!editing ? (
                <button 
                  onClick={() => setEditing(true)}
                  className="px-5 py-2.5 bg-[#00BCD4] text-white rounded-xl font-bold text-[13px] flex items-center gap-2 hover:bg-[#00acc1] transition-all shadow-md shadow-[#00BCD4]/20"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setEditing(false); setFormData(settings || {}); }}
                    className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-[13px] flex items-center gap-2 hover:bg-slate-200 transition-all"
                  >
                    <X className="w-4 h-4" />
                    Batal
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2.5 bg-[#00BCD4] text-white rounded-xl font-bold text-[13px] flex items-center gap-2 hover:bg-[#00acc1] transition-all shadow-md shadow-[#00BCD4]/20 disabled:opacity-50"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Simpan
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 lg:p-8 space-y-8">
              {/* Logo Section */}
              <div>
                <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Layout className="w-3.5 h-3.5" /> Logo Sekolah
                </label>
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden group relative transition-all hover:border-[#00BCD4]/50">
                    {formData.logoUrl ? (
                      <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">LOGO</span>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 text-[#00BCD4] animate-spin" />
                      </div>
                    )}
                  </div>
                  {editing && (
                    <div className="flex-1 space-y-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="h-11 px-4 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
                        >
                          <Upload className="w-4 h-4 text-[#00BCD4]" />
                          Pilih File dari Lokal
                        </button>
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          hidden 
                          accept="image/*"
                          onChange={handleFileUpload}
                        />
                      </div>
                      <div className="space-y-1">
                        <input 
                          type="text" 
                          placeholder="Atau masukkan Link Logo URL (https://...)" 
                          className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/20 transition-all"
                          value={formData.logoUrl || ''}
                          onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                        />
                        <p className="text-[11px] text-slate-400 font-medium italic">Gunakan file PNG transparan untuk hasil terbaik di dashboard.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                <div className="md:col-span-2">
                  <label className="text-[13px] font-bold text-slate-600 mb-2 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-[#00BCD4]" /> Nama Sekolah/Instansi
                  </label>
                  <input 
                    disabled={!editing}
                    type="text" 
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-bold text-slate-800 disabled:bg-slate-50/50 disabled:text-slate-500 transition-all border-none focus:ring-2 focus:ring-[#00BCD4]/20"
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
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-medium text-slate-800 disabled:bg-slate-50/50 disabled:text-slate-500 transition-all border-none focus:ring-2 focus:ring-[#00BCD4]/20 resize-none"
                    value={formData.alamatSekolah || ''}
                    onChange={(e) => setFormData({ ...formData, alamatSekolah: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[13px] font-bold text-slate-600 mb-2 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#00BCD4]" /> Telepon
                  </label>
                  <input 
                    disabled={!editing}
                    type="text" 
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-medium text-slate-800 disabled:bg-slate-50/50"
                    value={formData.telepon || ''}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[13px] font-bold text-slate-600 mb-2 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#00BCD4]" /> Email
                  </label>
                  <input 
                    disabled={!editing}
                    type="email" 
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-medium text-slate-800 disabled:bg-slate-50/50"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[13px] font-bold text-slate-600 mb-2 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-[#00BCD4]" /> Website
                  </label>
                  <input 
                    disabled={!editing}
                    type="text" 
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-medium text-slate-800 disabled:bg-slate-50/50"
                    value={formData.website || ''}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[13px] font-bold text-slate-600 mb-2 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#00BCD4]" /> Kepala Sekolah
                  </label>
                  <input 
                    disabled={!editing}
                    type="text" 
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-medium text-slate-800 disabled:bg-slate-50/50"
                    value={formData.kepalaSekolah || ''}
                    onChange={(e) => setFormData({ ...formData, kepalaSekolah: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[13px] font-bold text-slate-600 mb-2 flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5 text-[#00BCD4]" /> NPSN (Nomor Pokok Sekolah Nasional)
                  </label>
                  <input 
                    disabled={!editing}
                    type="text" 
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-medium text-slate-800 disabled:bg-slate-50/50"
                    value={formData.npsn || ''}
                    onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-50">
              <p className="text-[11px] text-slate-400 font-medium">
                Terakhir diperbarui: {settings?.updatedAt ? new Date(settings.updatedAt).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Previews & Info */}
        <div className="space-y-6">
          {/* Header Preview Title Card */}
          <div className="bg-white rounded-3xl border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
            <label className="text-[15px] font-bold text-slate-800 flex items-center gap-2 mb-1">
              <RefreshCw className="w-4 h-4 text-[#00BCD4]" /> Preview Tampilan
            </label>
            <p className="text-[12px] text-slate-400 font-medium leading-relaxed">Pratinjau bagaimana informasi sekolah akan ditampilkan</p>
          </div>

          {/* Dashboard Header Preview Card */}
          <div className="bg-white rounded-3xl border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 space-y-4">
            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Layout className="w-3.5 h-3.5 text-blue-400" /> Dashboard Header
            </label>
            <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 shrink-0">
                <img src={formData.logoUrl || '/logo-placeholder.png'} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-slate-800 leading-none">{formData.namaSekolah || 'Nama Sekolah'}</h4>
                <p className="text-[11px] text-slate-400 mt-1 font-medium tracking-wide uppercase">Sistem Informasi Magang</p>
              </div>
            </div>
          </div>

          {/* Document Header Preview Card */}
          <div className="bg-white rounded-3xl border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 space-y-4">
            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-green-400" /> Header Rapor/Sertifikat
            </label>
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
              <div className="w-12 h-12 mb-3 bg-slate-50 rounded-xl p-2 flex items-center justify-center">
                <img src={formData.logoUrl || '/logo-placeholder.png'} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <h4 className="text-[15px] font-extrabold text-slate-900 tracking-tight leading-none uppercase">{formData.namaSekolah || 'NAMA SEKOLAH'}</h4>
              <p className="text-[9px] text-slate-500 mt-2 leading-relaxed font-medium max-w-[200px]">
                {formData.alamatSekolah || 'Alamat Lengkap'} <br/>
                Telp: {formData.telepon || '-'} | Email: {formData.email || '-'}
              </p>
              <div className="w-full h-[1.5px] bg-slate-900 mt-4" />
              <div className="w-full h-[0.5px] bg-slate-900 mt-[1.5px]" />
              <span className="text-[10px] font-black tracking-[3px] mt-4 uppercase text-slate-800">SERTIFIKAT MAGANG</span>
            </div>
          </div>

          {/* Print Footer Preview Card */}
          <div className="bg-white rounded-3xl border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 space-y-4">
            <label className="text-[12px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Printer className="w-3.5 h-3.5 text-purple-400" /> Dokumen Cetak
            </label>
            <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-white p-2 flex items-center justify-center border border-slate-100 shadow-sm">
                  <img src={formData.logoUrl || '/logo-placeholder.png'} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-slate-800 leading-none">{formData.namaSekolah}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">NPSN: {formData.npsn}</p>
                </div>
              </div>
              <div className="space-y-1.5 pl-0.5">
                <div className="flex items-start gap-2 text-[10px] text-slate-500 font-medium">
                  <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-slate-300" /> 
                  <span className="line-clamp-2">{formData.alamatSekolah}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                  <Phone className="w-3 h-3 shrink-0 text-slate-300" /> {formData.telepon}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-700 font-bold mt-3 pt-3 border-t border-slate-200/60">
                  <User className="w-3.5 h-3.5 shrink-0 text-[#00BCD4]" /> 
                  <span className="line-clamp-1">Kepala Sekolah: {formData.kepalaSekolah}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-6 bg-blue-50/40 rounded-3xl border border-blue-100/50">
            <h4 className="text-[14px] font-bold text-blue-800 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" /> Informasi Penggunaan:
            </h4>
            <ul className="space-y-3">
              {[
                { icon: Layout, color: 'text-blue-500', label: 'Dashboard', text: 'Logo & nama ditampilkan di header navigasi' },
                { icon: FileText, color: 'text-green-500', label: 'Rapor/Sertifikat', text: 'Informasi lengkap sebagai kop dokumen resmi' },
                { icon: Printer, color: 'text-purple-500', label: 'Dokumen Cetak', text: 'Detail identitas pada footer laporan sistem' },
              ].map((item, idx) => (
                <li key={idx} className="flex gap-3 text-[12px] text-blue-700 font-medium leading-tight">
                  <item.icon className={`w-4 h-4 shrink-0 opacity-70 mt-0.5 ${item.color}`} />
                  <span><strong className="font-bold">{item.label}:</strong> {item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
