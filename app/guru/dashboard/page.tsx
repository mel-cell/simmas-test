'use client'

import { 
  Users, 
  Briefcase, 
  FileText, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { GuruDashboardResponse } from '@/types/guru'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { toast } from 'sonner'

export default function GuruDashboard() {
  const [data, setData] = useState<GuruDashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const res = await api.guru.getDashboard()
      setData(res)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal mengambil data dashboard'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-8 w-full p-8 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 rounded-[24px]" />
          <Skeleton className="h-40 rounded-[24px]" />
          <Skeleton className="h-40 rounded-[24px]" />
        </div>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-64 rounded-[32px]" />
          <Skeleton className="h-64 rounded-[32px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-20 px-4 md:px-8 max-w-[1600px] mx-auto text-sans">
      {/* Header Section */}
      <div className="mt-6 flex flex-col gap-1">
        <h1 className="text-3xl font-medium text-slate-800 tracking-tight">Dashboard Guru</h1>
        <p className="text-slate-500 font-medium text-sm">Pantau dan kelola siswa bimbingan Anda</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Siswa', value: data?.stats.totalSiswa || 0, sub: 'Seluruh siswa bimbingan', icon: Users, color: 'blue' },
          { label: 'Siswa Magang', value: data?.stats.siswaMagang || 0, sub: 'Sedang aktif di industri', icon: Briefcase, color: 'blue' },
          { label: 'Logbook Hari Ini', value: data?.stats.logbookHariIni || 0, sub: 'Laporan masuk hari ini', icon: FileText, color: 'orange' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-[24px] border border-slate-100 p-8 shadow-sm flex items-center justify-between group hover:border-[#2563EB]/20 transition-all hover:shadow-md">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-[2px]">{stat.label}</span>
              <div className="flex items-baseline gap-2">
                 <h2 className="text-4xl font-medium text-slate-800 tracking-tight">{stat.value}</h2>
              </div>
              <p className="text-[11px] font-medium text-slate-400 mt-1">{stat.sub}</p>
            </div>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
              stat.color === 'blue' ? 'bg-blue-50 text-blue-500 group-hover:bg-[#2563EB] group-hover:text-white' :
              'bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white'
            }`}>
              <stat.icon className="w-8 h-8" strokeWidth={2} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Magang List */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-blue-50 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-[#2563EB]" />
               </div>
               <h3 className="text-xl font-medium text-slate-800 tracking-tight">Magang Terbaru</h3>
            </div>
            <Link href="/guru/magang">
               <Button variant="ghost" className="text-[13px] font-medium text-[#2563EB] hover:bg-blue-50 h-9 rounded-xl transition-all">
                 Lihat Semua
               </Button>
            </Link>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden p-4">
            {data?.recentMagang && data.recentMagang.length > 0 ? (
              <div className="flex flex-col gap-1">
                {data.recentMagang.map((magang) => (
                  <Link key={magang.id} href={`/guru/magang`}>
                    <div className="p-5 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border font-medium text-lg transition-colors ${
                          magang.status === 'aktif' ? 'bg-green-50 text-green-500 border-green-100 group-hover:bg-white' :
                          magang.status === 'selesai' ? 'bg-blue-50 text-blue-500 border-blue-100 group-hover:bg-white' :
                          'bg-slate-50 text-slate-500 border-slate-100 group-hover:bg-white'
                        }`}>
                          {magang.siswa.full_name.charAt(0)}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <h4 className="font-medium text-slate-800 tracking-tight">{magang.siswa.full_name}</h4>
                          <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                            <MapPin className="w-3 h-3 text-[#2563EB]/60" /> {magang.dudi.nama_perusahaan}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-[10px] font-medium px-3 py-1 rounded-lg uppercase tracking-widest ${
                          magang.status === 'aktif' ? 'bg-green-100 text-green-700' :
                          magang.status === 'selesai' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {magang.status}
                        </span>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#2563EB] transition-colors group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                 <AlertCircle className="w-12 h-12 text-slate-200 mb-4" />
                 <p className="font-medium text-slate-400">Belum ada aktivitas magang</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Logbooks List */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-blue-50 rounded-xl">
                  <FileText className="w-5 h-5 text-[#2563EB]" />
               </div>
               <h3 className="text-xl font-medium text-slate-800 tracking-tight">Logbook Terbaru</h3>
            </div>
            <Link href="/guru/approval">
               <Button variant="ghost" className="text-[13px] font-medium text-[#2563EB] hover:bg-blue-50 h-9 rounded-xl transition-all">
                 Review Semua
               </Button>
            </Link>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden p-4">
            {data?.recentLogbooks && data.recentLogbooks.length > 0 ? (
              <div className="flex flex-col gap-1">
                {data.recentLogbooks.map((log) => (
                  <Link key={log.id} href="/guru/approval">
                    <div className="p-5 rounded-2xl flex flex-col gap-3 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <span className="text-[10px] font-medium text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                               {format(new Date(log.tgl), 'd MMM yyyy', { locale: localeId })}
                            </span>
                            <span className="text-[11px] font-medium text-slate-400">ID: {log.id.slice(0, 8)}</span>
                         </div>
                         <div className="flex items-center gap-1.5 text-orange-500 bg-orange-50 px-3 py-1 rounded-full shadow-sm shadow-orange-500/5">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-medium uppercase tracking-wider">Pending Review</span>
                         </div>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                         <h4 className="font-medium text-slate-700 leading-tight line-clamp-1 group-hover:text-[#2563EB] transition-colors">
                           {log.kegiatan}
                         </h4>
                         <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                            Review for: <span className="text-slate-500">{log.siswa?.full_name}</span>
                         </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                 <CheckCircle2 className="w-12 h-12 text-slate-200 mb-4" />
                 <p className="font-medium text-slate-400">Semua logbook telah diperiksa</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
