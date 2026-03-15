'use client'

import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  User, 
  Hash, 
  Eye,
  FileText, 
  Printer, 
  CheckCircle2,
  RefreshCw,
  Upload,
  AlertTriangle,
  Layout,
  Edit2,
  Save,
  X,
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
        setMessage({ type: 'error', text: 'Gagal mengunggah logo.' })
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
        await refreshSettings()
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

  const InputLabel = ({ label, icon: Icon, required }: { label: string, icon?: React.ElementType, required?: boolean }) => (
    <label className="flex items-center gap-2 text-[13px] font-bold text-slate-500 mb-2">
      {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
      {label} {required && <span className="text-red-500">*</span>}
    </label>
  )

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] sm:text-[28px] font-bold text-slate-800 tracking-tight">Pengaturan Sekolah</h2>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 animate-in fade-in zoom-in duration-300 ${
          message.type === 'success' ? 'bg-[#ECFDF5] border-[#D1FAE5] text-[#059669]' : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          <div className="flex items-center gap-3">
             {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
             <span className="text-[14px] font-bold">{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-10 gap-8 items-start text-left">
        
        {/* Left Column: Form (6/10) */}
        <div className="xl:col-span-6 space-y-6">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden p-6 sm:p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center">
                  <Layout className="w-5 h-5 text-[#2563EB]" />
                </div>
                <h3 className="text-[18px] font-bold text-slate-800 tracking-tight">Informasi Sekolah</h3>
              </div>

              {!loading && (
                !editing ? (
                  <button 
                     onClick={() => setEditing(true)}
                    className="h-10 px-6 bg-[#2563EB] text-white rounded-xl font-bold text-[13px] flex items-center gap-2 hover:bg-[#1d4ed8] transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { setEditing(false); setFormData(settings || {}); }}
                      className="h-10 px-5 bg-slate-100 text-slate-600 rounded-xl font-bold text-[13px] flex items-center gap-2 hover:bg-slate-200 transition-all"
                    >
                      Batal
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={saving}
                      className="h-10 px-6 bg-[#2563EB] text-white rounded-xl font-bold text-[13px] flex items-center gap-2 hover:bg-[#1d4ed8] transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                      {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Simpan
                    </button>
                  </div>
                )
              )}
            </div>

            {loading ? (
               <div className="space-y-6">
                  <Skeleton className="w-24 h-24 rounded-2xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-32 w-full rounded-xl" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                  </div>
               </div>
            ) : (
              <div className="space-y-6">
                {/* Logo Section */}
                <div className="space-y-3">
                  <InputLabel label="Logo Sekolah" icon={Upload} />
                  <div className="flex items-center gap-6">
                    <div 
                      onClick={() => editing && fileInputRef.current?.click()}
                      className={`w-28 h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all group relative ${
                        editing ? 'cursor-pointer hover:border-[#2563EB] border-slate-200 bg-slate-50' : 'border-slate-100 bg-slate-50/50'
                      }`}
                    >
                      {formData.logoUrl ? (
                         <Image src={formData.logoUrl} alt="Logo" fill className="object-contain p-2" />
                      ) : (
                         <div className="text-center">
                            <Layout className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logo</span>
                         </div>
                      )}
                      {uploading && (
                         <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <RefreshCw className="w-6 h-6 text-[#2563EB] animate-spin" />
                         </div>
                      )}
                    </div>
                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileUpload} />
                    {editing && (
                        <p className="text-[11px] text-slate-400 font-medium italic max-w-[200px] leading-relaxed">
                           Klik area kotak untuk mengganti logo. Gunakan format PNG Transparan untuk hasil terbaik.
                        </p>
                    )}
                  </div>
                </div>

                {/* Main Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <InputLabel label="Nama Sekolah/Instansi" icon={Building2} required />
                    <input 
                      disabled={!editing}
                      type="text" 
                      className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-[16px] text-[14px] font-bold text-slate-800 disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                      value={formData.namaSekolah || ''}
                      onChange={(e) => setFormData({ ...formData, namaSekolah: e.target.value })}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <InputLabel label="Alamat Lengkap" icon={MapPin} />
                    <textarea 
                      disabled={!editing}
                      rows={3}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[16px] text-[14px] font-medium text-slate-800 disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all resize-none"
                      value={formData.alamatSekolah || ''}
                      onChange={(e) => setFormData({ ...formData, alamatSekolah: e.target.value })}
                    />
                  </div>

                  <div>
                    <InputLabel label="Telepon" icon={Phone} />
                    <input 
                      disabled={!editing}
                      type="text" 
                      className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-[16px] text-[14px] font-medium text-slate-800 disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                      value={formData.telepon || ''}
                      onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                    />
                  </div>

                  <div>
                    <InputLabel label="Email" icon={Mail} />
                    <input 
                      disabled={!editing}
                      type="email" 
                      className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-[16px] text-[14px] font-medium text-slate-800 disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <InputLabel label="Website" icon={Globe} />
                    <input 
                      disabled={!editing}
                      type="text" 
                      className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-[16px] text-[14px] font-medium text-slate-800 disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                      value={formData.website || ''}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <InputLabel label="Kepala Sekolah" icon={User} />
                    <input 
                      disabled={!editing}
                      type="text" 
                      className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-[16px] text-[14px] font-medium text-slate-800 disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                      value={formData.kepalaSekolah || ''}
                      onChange={(e) => setFormData({ ...formData, kepalaSekolah: e.target.value })}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <InputLabel label="NPSN (Nomor Pokok Sekolah Nasional)" icon={Hash} />
                    <input 
                      disabled={!editing}
                      type="text" 
                      className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-[16px] text-[14px] font-medium text-slate-800 disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                      value={formData.npsn || ''}
                      onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50">
                   <p className="text-[12px] text-slate-400 font-medium italic">
                      Terakhir diperbarui: {settings?.updatedAt ? new Date(settings.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                   </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Previews (4/10) */}
        <div className="xl:col-span-4 space-y-6">
          <div className="flex items-center gap-4 mb-8 bg-white rounded-[24px] border border-slate-100 p-5 sm:p-6 space-y-4 shadow-sm">
             <div className="w-12 h-12 rounded-[18px] bg-[#2563EB]/10 flex items-center justify-center shrink-0 border border-[#2563EB]/5">
                <Eye className="w-6 h-6 text-[#2563EB]" />
             </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-[16px] font-black text-slate-800 uppercase tracking-widest text-left">Preview Tampilan</h4>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 rounded-full">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider">Live</span>
                  </div>
                </div>
                <p className="text-[12px] text-slate-400 font-bold -mt-0.5 text-left">Pratinjau bagaimana informasi sekolah ditampilkan</p>
              </div>
          </div>

          {/* Dashboard Header Preview */}
          <div className="bg-white rounded-[24px] border border-slate-100 p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
                <Layout className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <span className="text-[13px] font-bold text-slate-700">Dashboard Header</span>
            </div>
              <div className="p-4 bg-blue-50/50 rounded-[20px] border border-blue-100/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center p-1.5 shrink-0 shadow-sm relative overflow-hidden">
                  {formData.logoUrl ? (
                    <Image src={formData.logoUrl} alt="Logo" width={32} height={32} className="object-contain" />
                  ) : (
                    <span className="text-[8px] font-black text-slate-300">LOGO</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-[13px] font-black leading-tight truncate ${formData.namaSekolah ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                    {formData.namaSekolah || 'Belum Diatur'}
                  </h4>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight opacity-60">Sistem Informasi Magang</p>
                </div>
              </div>
            </div>

            {/* Header Rapor/Sertifikat Preview */}
            <div className="bg-white rounded-[24px] border border-slate-100 p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2">
                 <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                 </div>
                 <span className="text-[13px] font-bold text-slate-700">Header Rapor/Sertifikat</span>
              </div>
              <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-1">
                 <div className="p-6 bg-white rounded-xl border border-slate-100 flex flex-col items-center shadow-sm">
                    <div className="w-12 h-12 mb-4 relative flex items-center justify-center">
                      {formData.logoUrl ? (
                        <Image src={formData.logoUrl} alt="Logo" width={48} height={48} className="object-contain" />
                      ) : (
                        <div className="w-full h-full bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 text-[8px] font-black text-slate-300">LOGO</div>
                      )}
                    </div>
                    <h5 className={`text-[13px] font-black uppercase text-center leading-tight mb-1 ${formData.namaSekolah ? 'text-slate-900' : 'text-slate-400 italic'}`}>
                      {formData.namaSekolah || 'BELUM DIATUR'}
                    </h5>
                    <p className={`text-[7px] font-bold max-w-[200px] text-center mb-0.5 leading-tight ${formData.alamatSekolah ? 'text-slate-500' : 'text-slate-400 italic'}`}>
                      {formData.alamatSekolah || 'Alamat belum diatur'}
                    </p>
                    <p className="text-[7px] font-bold text-slate-400 mb-3 text-center">
                      Telp: {formData.telepon || '-'} | Email: {formData.email || '-'} | Web: {formData.website || '-'}
                    </p>
                    <div className="w-full h-[0.5px] bg-slate-300 mb-[1px]" />
                    <div className="w-full h-[2px] bg-black rounded-full" />
                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-[4px] mt-4">SERTIFIKAT MAGANG</p>
                 </div>
              </div>
            </div>

            {/* Dokumen Cetak Preview */}
            <div className="bg-white rounded-[24px] border border-slate-100 p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2">
                 <div className="w-6 h-6 rounded-md bg-purple-50 flex items-center justify-center">
                  <Printer className="w-3.5 h-3.5 text-purple-500" />
                 </div>
                 <span className="text-[13px] font-bold text-slate-700">Dokumen Cetak</span>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                 <div className="flex gap-4 items-start mb-4">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5">
                      {formData.logoUrl ? (
                       <Image src={formData.logoUrl} alt="Logo" width={32} height={32} className="object-contain" />
                      ) : (
                        <span className="text-[6px] font-black text-slate-300">LOGO</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h5 className={`text-[12px] font-black leading-tight uppercase mb-0.5 truncate ${formData.namaSekolah ? 'text-slate-900' : 'text-slate-400 italic'}`}>
                        {formData.namaSekolah || 'Belum Diatur'}
                      </h5>
                      <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">NPSN: {formData.npsn || '-'}</p>
                    </div>
                 </div>
                 <div className="space-y-1.5 border-t border-slate-50 pt-3">
                    <div className={`flex items-start gap-2 text-[9px] font-bold leading-relaxed ${formData.alamatSekolah ? 'text-slate-500' : 'text-slate-400 italic'}`}>
                       <MapPin className="w-3 h-3 text-slate-300 shrink-0 mt-0.5" />
                       {formData.alamatSekolah || 'Alamat belum diatur'}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold">
                         <Phone className="w-3 h-3 text-slate-300" />
                         {formData.telepon || '-'}
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold">
                         <Mail className="w-3 h-3 text-slate-300" />
                         {formData.email || '-'}
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold truncate">
                         <Globe className="w-3 h-3 text-slate-300" />
                         {formData.website || '-'}
                      </div>
                    </div>
                    <div className="pt-2">
                       <p className="text-[9px] font-bold text-slate-800">
                          Kepala Sekolah: <span className="text-slate-500 font-bold">{formData.kepalaSekolah || '-'}</span>
                       </p>
                    </div>
                 </div>
              </div>
            </div>

            {/* Usage Info Card */}
            <div className="bg-[#EFF6FF] rounded-[24px] p-6 border border-[#DBEAFE] space-y-4">
               <h4 className="text-[14px] font-black text-blue-800">Informasi Penggunaan:</h4>
               <ul className="space-y-3">
                  <li className="flex gap-3 text-[12px] text-blue-600 font-bold">
                     <Layout className="w-4 h-4 shrink-0" />
                     <span>Dashboard: Logo dan nama sekolah ditampilkan di header navigasi</span>
                  </li>
                  <li className="flex gap-3 text-[12px] text-blue-600 font-bold">
                     <FileText className="w-4 h-4 shrink-0" />
                     <span>Rapor/Sertifikat: Informasi lengkap sebagai kop dokumen resmi</span>
                  </li>
                  <li className="flex gap-3 text-[12px] text-blue-600 font-bold">
                     <Printer className="w-4 h-4 shrink-0" />
                     <span>Dokumen Cetak: Footer atau header pada laporan yang dicetak</span>
                  </li>
               </ul>
            </div>
        </div>
      </div>
    </div>
  )
}
