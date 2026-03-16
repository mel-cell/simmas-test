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
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { SiswaJournal } from '@/types/siswa'

export default function EditJurnal() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    tgl: '',
    kegiatan: '',
    kendala: '',
    status: ''
  })

  useEffect(() => {
    async function loadDetail() {
      try {
        const data: SiswaJournal = await api.siswa.getJournalDetail(id)
        if (data) {
          setFormData({
            tgl: data.tgl,
            kegiatan: data.kegiatan,
            kendala: data.kendala || '',
            status: data.status
          })
        }
      } catch (error) {
        console.error('Failed to load journal:', error)
        alert('Gagal memuat detail jurnal.')
        router.push('/siswa/jurnal')
      } finally {
        setLoading(false)
      }
    }
    loadDetail()
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent, targetStatus?: 'draft' | 'menunggu') => {
    e.preventDefault()
    if (!formData.kegiatan) return

    try {
      setSaving(true)
      const res = await api.siswa.updateJournal(id, { 
        ...formData, 
        status: targetStatus || (formData.status as 'draft' | 'menunggu') 
      })
      if (res.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/siswa/jurnal')
        }, 2000)
      }
    } catch (err: unknown) {
      const error = err as Error
      console.error('Failed to update journal:', error)
      alert(error?.message || 'Gagal mengubah jurnal.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto w-full pb-20">
        <Skeleton className="h-8 w-48 mb-8" />
        <Skeleton className="h-12 w-64 mb-10" />
        <Skeleton className="h-96 w-full rounded-[32px]" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Perubahan Berhasil Disimpan!</h2>
        <p className="text-slate-500 mt-2 font-medium">Laporan kegiatan Anda telah diperbarui.</p>
        <p className="text-slate-400 text-xs mt-8 tracking-widest uppercase">Mengalihkan...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto w-full pb-20">
      <div className="mb-8">
        <Link 
          href="/siswa/jurnal" 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors w-fit group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          KEMBALI KE DAFTAR
        </Link>
      </div>

      <div className="flex flex-col gap-2 mb-10">
        <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Edit Laporan Harian</h2>
        <div className="flex items-center gap-2">
           <p className="text-slate-500 font-medium text-sm tracking-widest uppercase opacity-60">Status Sekarang:</p>
           <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{formData.status}</span>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="bg-white rounded-[32px] border border-slate-100 p-8 md:p-10 shadow-sm flex flex-col gap-10">
          
          {/* Date Picker (Disabled for edit usually to maintain integrity of 1 date 1 journal) */}
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
              <Calendar className="w-4 h-4 text-blue-500" />
              Tanggal Kegiatan
            </label>
            <div className="px-6 py-4 bg-slate-100 border-2 border-slate-100 rounded-2xl font-medium text-slate-400 cursor-not-allowed w-fit">
               {formData.tgl ? format(new Date(formData.tgl), 'd MMMM yyyy') : '-'}
            </div>
            <p className="text-[10px] text-slate-400 font-medium italic">* Tanggal tidak dapat diubah setelah dibuat.</p>
          </div>

          {/* Kegiatan */}
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
              <LayoutList className="w-4 h-4 text-blue-500" />
              Deskripsi Kegiatan
            </label>
            <textarea 
              required
              placeholder="Jelaskan apa saja yang Anda lakukan hari ini..."
              className="w-full h-48 px-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-3xl font-semimedium text-slate-700 focus:border-blue-500/20 focus:bg-white transition-all outline-none resize-none leading-relaxed"
              value={formData.kegiatan}
              onChange={(e) => setFormData({...formData, kegiatan: e.target.value})}
            />
          </div>

          {/* Kendala */}
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              Kendala (Opsional)
            </label>
            <textarea 
              placeholder="Adakah kesulitan?"
              className="w-full h-32 px-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-3xl font-semimedium text-slate-700 focus:border-orange-500/20 focus:bg-white transition-all outline-none resize-none leading-relaxed"
              value={formData.kendala}
              onChange={(e) => setFormData({...formData, kendala: e.target.value})}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-center md:items-stretch bg-white/50 backdrop-blur-sm p-4 rounded-[40px] border border-white shadow-xl">
           <button 
             type="button"
             disabled={saving || !formData.kegiatan}
             onClick={(e) => handleSubmit(e, 'draft')}
             className="w-full md:w-fit group bg-white hover:bg-slate-50 text-slate-700 px-8 py-5 rounded-[32px] font-medium tracking-tight flex items-center justify-center gap-3 transition-all border border-slate-200 active:scale-[0.98] disabled:opacity-50"
           >
             {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 text-slate-400" />}
             SIMPAN SEBAGAI DRAFT
           </button>
           <button 
             type="button"
             disabled={saving || !formData.kegiatan}
             onClick={(e) => handleSubmit(e, 'menunggu')}
             className="w-full flex-1 group bg-[#0F172A] hover:bg-black text-white px-10 py-5 rounded-[32px] font-black italic tracking-tighter flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
           >
             {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6 group-hover:scale-110 transition-transform" />}
             KIRIM / UPDATE LAPORAN
           </button>
        </div>
      </div>
    </div>
  )
}
