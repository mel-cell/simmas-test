'use client'

import { 
  ArrowLeft, 
  Save, 
  Calendar, 
  LayoutList, 
  AlertTriangle,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import { useState } from 'react'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'

export default function BuatJurnalBaru() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    tgl: format(new Date(), 'yyyy-MM-dd'),
    kegiatan: '',
    kendala: ''
  })

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'menunggu') => {
    e.preventDefault()
    if (!formData.kegiatan) return

    try {
      setLoading(true)
      const res = await api.siswa.createJournal({ ...formData, status })
      if (res.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/siswa/jurnal')
        }, 2000)
      }
    } catch (err: unknown) {
      const error = err as Error
      console.error('Failed to create journal:', error)
      alert(error?.message || 'Gagal menyimpan jurnal. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-800">Jurnal Berhasil Disimpan!</h2>
        <p className="text-slate-500 mt-2 font-medium">Laporan kegiatan Anda telah berhasil diproses.</p>
        <p className="text-slate-400 text-xs mt-8">Mengalihkan halaman...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto w-full pb-20">
      <div className="mb-8">
        <Link 
          href="/siswa/jurnal" 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          KEMBALI KE DAFTAR
        </Link>
      </div>

      <div className="flex flex-col gap-2 mb-10">
        <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Buat Laporan Harian</h2>
        <p className="text-slate-500 font-bold text-sm tracking-widest uppercase opacity-60">Input Kegiatan Magang</p>
      </div>

      <div className="flex flex-col gap-8">
        <div className="bg-white rounded-[32px] border border-slate-100 p-8 md:p-10 shadow-sm flex flex-col gap-10">
          
          {/* Date Picker */}
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
              <Calendar className="w-4 h-4 text-blue-500" />
              Tanggal Kegiatan
            </label>
            <input 
              type="date"
              required
              className="w-full md:w-fit px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-700 focus:border-blue-500/20 focus:bg-white transition-all outline-none"
              value={formData.tgl}
              onChange={(e) => setFormData({...formData, tgl: e.target.value})}
            />
          </div>

          {/* Kegiatan */}
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
              <LayoutList className="w-4 h-4 text-blue-500" />
              Deskripsi Kegiatan
            </label>
            <textarea 
              required
              placeholder="Jelaskan apa saja yang Anda lakukan hari ini di tempat magang..."
              className="w-full h-48 px-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-3xl font-semibold text-slate-700 focus:border-blue-500/20 focus:bg-white transition-all outline-none resize-none leading-relaxed placeholder:text-slate-300"
              value={formData.kegiatan}
              onChange={(e) => setFormData({...formData, kegiatan: e.target.value})}
            />
            <p className="text-[11px] text-slate-400 font-medium italic">* Tuliskan secara detail langkah-langkah atau pekerjaan yang dilakukan.</p>
          </div>

          {/* Kendala */}
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              Kendala (Opsional)
            </label>
            <textarea 
              placeholder="Adakah kesulitan atau tantangan yang dihadapi? Jika tidak ada, kosongkan saja."
              className="w-full h-32 px-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-3xl font-semibold text-slate-700 focus:border-orange-500/20 focus:bg-white transition-all outline-none resize-none leading-relaxed placeholder:text-slate-300"
              value={formData.kendala}
              onChange={(e) => setFormData({...formData, kendala: e.target.value})}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-center md:items-stretch bg-white/50 backdrop-blur-sm p-4 rounded-[40px] border border-white shadow-xl">
           <button 
             type="button"
             disabled={loading || !formData.kegiatan}
             onClick={(e) => handleSubmit(e, 'draft')}
             className="w-full md:w-fit group bg-white hover:bg-slate-50 text-slate-700 px-8 py-5 rounded-[32px] font-bold tracking-tight flex items-center justify-center gap-3 transition-all border border-slate-200 active:scale-[0.98] disabled:opacity-50"
           >
             {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 text-slate-400" />}
             SIMPAN DRAFT
           </button>
           <button 
             type="button"
             disabled={loading || !formData.kegiatan}
             onClick={(e) => handleSubmit(e, 'menunggu')}
             className="w-full flex-1 group bg-[#0F172A] hover:bg-black text-white px-10 py-5 rounded-[32px] font-black italic tracking-tighter flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
           >
             {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6 group-hover:scale-110 transition-transform" />}
             KIRIM LAPORAN SEKARANG
           </button>
        </div>
      </div>
    </div>
  )
}
