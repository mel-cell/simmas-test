'use client'

import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Building2, 
  UserSquare2, 
  CalendarDays,
  Plus,
  BookOpen,
  Info,
  ArrowRight,
  TrendingUp
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { SiswaDashboardResponse } from '@/types/siswa'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import Link from 'next/link'
import { JournalModal } from '@/components/siswa/JournalModal'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function SiswaDashboard() {
  const [data, setData] = useState<SiswaDashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)
        const res = await api.siswa.getDashboard()
        setData(res)
      } catch (error) {
        console.error('Failed to load student dashboard:', error)
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])
  
  const profile = data?.profile
  const magang = data?.magang
  const stats = data?.stats
  const recentJournals = data?.recentJournals || []

  const userName = profile?.full_name || 'Siswa'
  const currentDate = format(new Date(), 'd MMMM yyyy', { locale: localeId })

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-10 animate-pulse">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1500px] mx-auto w-full px-4 md:px-8 pb-10">
      {/* Welcome Banner */}
      <div className="bg-[#2563EB] rounded-2xl p-6 md:p-10 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col gap-1">
          <h2 className="text-2xl md:text-4xl font-medium italic tracking-tighter">Selamat Datang, {userName}! 👋</h2>
          <p className="text-blue-100 font-medium text-sm md:text-lg opacity-90 flex items-center gap-2">
            <span>{profile?.nomor_induk || 'NIS'}</span>
            <span className="opacity-40">•</span>
            <span>{profile?.kelas || 'Kelas'}</span>
            <span className="opacity-40">•</span>
            <span>{profile?.jurusan || 'Jurusan'}</span>
          </p>
        </div>
        <div className="relative z-10 hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl mt-4 sm:mt-0 font-medium text-sm border border-white/20 shadow-xl shadow-black/5">
          <CalendarDays className="w-4 h-4 text-blue-200" />
          <span>{currentDate}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Jurnal */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4 group hover:shadow-xl hover:shadow-blue-500/5 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-slate-500 tracking-tight">Total Jurnal</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className="text-4xl font-medium text-slate-800 tracking-tighter">{stats?.total || 0}</h3>
            <span className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wider">Jurnal yang dibuat</span>
          </div>
        </div>

        {/* Disetujui */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4 group hover:shadow-xl hover:shadow-green-500/5 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-slate-500 tracking-tight">Disetujui</span>
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className="text-4xl font-medium text-slate-800 tracking-tighter">{stats?.disetujui || 0}</h3>
            <span className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wider">Jurnal disetujui</span>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4 group hover:shadow-xl hover:shadow-yellow-500/5 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-slate-500 tracking-tight">Pending</span>
            <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className="text-4xl font-medium text-slate-800 tracking-tighter">{stats?.pending || 0}</h3>
            <span className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wider">Menunggu verifikasi</span>
          </div>
        </div>

        {/* Ditolak */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4 group hover:shadow-xl hover:shadow-red-500/5 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-slate-500 tracking-tight">Ditolak</span>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className="text-4xl font-medium text-slate-800 tracking-tighter">{stats?.ditolak || 0}</h3>
            <span className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wider">Jurnal ditolak</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Kiri: Informasi Magang & Aktivitas Jurnal (2 Kolom) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Informasi Magang */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-8 py-5 border-b border-slate-50 bg-white flex items-center justify-between">
              <h3 className="font-medium text-[#0F172A] flex items-center gap-3 tracking-tight">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Building2 className="w-5 h-5 text-[#2563EB]" />
                </div>
                Informasi Magang
              </h3>
            </div>
            <div className="p-8 flex flex-col gap-8">
              {magang ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-3">
                       <span className="text-[10px] font-medium text-slate-400 lg:text-[11px] uppercase tracking-widest">Penempatan DUDI</span>
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                             <Building2 className="w-6 h-6 text-slate-400" />
                          </div>
                          <div className="flex flex-col gap-0.5">
                             <span className="font-medium text-slate-800 text-lg tracking-tight">{magang.dudi?.nama_perusahaan || '-'}</span>
                             <span className="text-xs text-slate-400 font-semimedium line-clamp-1">{magang.dudi?.alamat || '-'}</span>
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-col gap-3">
                       <span className="text-[10px] font-medium text-slate-400 lg:text-[11px] uppercase tracking-widest">Guru Pembimbing</span>
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                             <UserSquare2 className="w-6 h-6 text-slate-400" />
                          </div>
                          <div className="flex flex-col gap-0.5">
                             <span className="font-medium text-slate-800 text-lg tracking-tight">{magang.guru?.full_name || '-'}</span>
                             <span className="text-xs text-slate-400 font-semimedium">{magang.guru?.no_telp || '-'}</span>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 px-4 py-2 rounded-xl">
                      <CalendarDays className="w-4 h-4 text-slate-400" />
                      {magang.tgl_mulai ? format(new Date(magang.tgl_mulai), 'd MMM y', { locale: localeId }) : '-'} - {magang.tgl_selesai ? format(new Date(magang.tgl_selesai), 'd MMM y', { locale: localeId }) : '-'}
                    </div>
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-medium uppercase tracking-widest flex items-center gap-2 ${
                      magang.status === 'aktif' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-yellow-50 text-yellow-600 border border-yellow-100'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${magang.status === 'aktif' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                      Status {magang.status}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col gap-3 relative overflow-hidden group mt-4">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 group-hover:w-3 transition-all duration-300"></div>
                    <h5 className="text-xs font-medium text-blue-600 uppercase tracking-widest pl-2 flex items-center gap-2">
                       <Info className="w-4 h-4" /> Catatan Sistem:
                    </h5>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed pl-2  ">
                      &quot;Pastikan mengisi jurnal harian setiap hari sesuai dengan kegiatan yang dilakukan di tempat magang.&quot;
                    </p>
                  </div>
                </>
              ) : (
                <div className="py-16 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-slate-200">
                    <Building2 className="w-10 h-10" />
                  </div>
                  <div className="flex flex-col gap-1 max-w-xs">
                    <h4 className="text-slate-800 font-medium text-lg tracking-tight">Belum ada data magang</h4>
                    <p className="text-xs text-slate-400 font-semimedium leading-relaxed">Silakan hubungi guru pembimbing Anda untuk informasi penempatan magang.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Aktivitas Jurnal Terbaru */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col">
            <div className="px-8 py-5 border-b border-slate-50 bg-white flex justify-between items-center">
              <h3 className="font-medium text-[#0F172A] flex items-center gap-3 tracking-tight">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-700" />
                </div>
                Aktivitas Jurnal Terbaru
              </h3>
              <Link href="/siswa/jurnal" className="text-xs font-medium text-blue-700 hover:text-blue-700 tracking-widest uppercase flex items-center gap-1.5 group">
                Lihat Semua <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="flex flex-col p-8 gap-6">
              {recentJournals.length > 0 ? recentJournals.map((journal) => (
                <div key={journal.id} className="group border border-slate-50 hover:border-blue-100 bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-blue-600/5 transition-all flex flex-col gap-4 relative">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col gap-3 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-medium text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-lg border border-blue-100/50">
                          {format(new Date(journal.tgl), 'd MMMM yyyy', { locale: localeId })}
                        </span>
                        <span className={`text-[9px] font-medium px-3 py-1 rounded-lg border uppercase tracking-[2px] ${
                          journal.status === 'disetujui'
                            ? 'text-green-600 bg-green-50 border-green-100' 
                            : journal.status === 'ditolak'
                              ? 'text-red-600 bg-red-50 border-red-100'
                              : 'text-yellow-600 bg-yellow-50 border-yellow-101'
                        }`}>
                          {journal.status}
                        </span>
                      </div>
                      <h4 className="text-base font-medium text-slate-800 leading-relaxed mt-1">
                        {journal.kegiatan}
                      </h4>
                    </div>
                  </div>

                  {journal.catatan_guru && (
                    <div className="bg-slate-50 rounded-2xl p-4 overflow-hidden relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300"></div>
                      <div className="flex flex-col gap-2 pl-2">
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Catatan Guru Pembimbing
                        </span>
                        <p className="text-sm font-semimedium text-slate-600   leading-relaxed">&quot;{journal.catatan_guru}&quot;</p>
                      </div>
                    </div>
                  )}
                </div>
              )) : (
                <div className="py-16 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center gap-6">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-slate-200">
                    <BookOpen className="w-10 h-10" />
                  </div>
                  <div className="flex flex-col gap-1 max-w-xs">
                    <h4 className="text-slate-800 font-medium text-lg tracking-tight">Belum ada jurnal</h4>
                    <p className="text-xs text-slate-400 font-semimedium leading-relaxed">Mulai dokumentasikan kegiatan magang Anda hari ini.</p>
                  </div>
                  <Button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#2563EB] hover:bg-black text-white font-medium tracking-tighter px-8 py-3.5 rounded-2xl transition-all flex items-center gap-3 shadow-lg shadow-blue-500/20 active:scale-95 text-sm uppercase h-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Buat Jurnal Pertama
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kanan: Aksi Cepat (1 Kolom) */}
        <div className="flex flex-col gap-6 sticky top-24">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm flex flex-col overflow-hidden transition-all hover:shadow-2xl hover:shadow-black/5">
            <div className="px-8 py-5 border-b border-slate-50 bg-white">
              <h3 className="font-medium text-[#0F172A] flex items-center gap-3 tracking-tight">
                <div className="bg-blue-50 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-[#2563EB]" />
                </div>
                Aksi Cepat
              </h3>
            </div>
            
            <div className="p-8 flex flex-col gap-4">
              <Button 
                onClick={() => {
                  if (magang?.status === 'aktif') {
                    setIsModalOpen(true)
                  } else {
                    toast.error('Anda belum memiliki program magang yang aktif.')
                  }
                }}
                disabled={magang?.status !== 'aktif'}
                className="group w-full flex items-center justify-between bg-[#2563EB] hover:bg-black text-white font-medium px-6 py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/10 active:scale-[0.98] text-sm uppercase tracking-tighter h-auto border-none disabled:opacity-50 disabled:bg-slate-300"
              >
                <div className="flex items-center gap-3">
                  <Plus className="w-5 h-5" />
                  {magang?.status === 'aktif' ? 'Buat Jurnal Baru' : 'Belum Bisa Buat Jurnal'}
                </div>
                {magang?.status === 'aktif' && <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
              </Button>
              <Link href="/siswa/jurnal" className="group w-full flex items-center justify-between bg-white hover:bg-slate-50 text-[#0F172A] font-medium px-6 py-4 rounded-2xl transition-all border border-slate-100 shadow-sm active:scale-[0.98] text-sm tracking-tight">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  Lihat Semua Jurnal
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-800 transition-colors" />
              </Link>
              <Link href="/siswa/magang" className="group w-full flex items-center justify-between bg-white hover:bg-slate-50 text-[#0F172A] font-medium px-6 py-4 rounded-2xl transition-all border border-slate-100 shadow-sm active:scale-[0.98] text-sm tracking-tight">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Info className="w-4 h-4" />
                  </div>
                  Info Magang
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-800 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <JournalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        magangInfo={magang}
        onSuccess={() => {
          // Refresh data
          async function refresh() {
            setLoading(true)
            const res = await api.siswa.getDashboard()
            setData(res)
            setLoading(false)
          }
          refresh()
        }}
      />
    </div>
  )
}


