'use client'

import { 
  Users, 
  Building2, 
  GraduationCap, 
  BookOpen,
  CalendarDays,
  ArrowRight
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { AdminStats, RecentMagang, RecentLogbook, ActiveDudi } from '@/types/admin'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { api } from '@/lib/api'
import { StatCard } from '@/components/admin/StatCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useSchoolSettings } from '@/components/providers/SchoolSettingsProvider'
import Link from 'next/link'

export default function AdminDashboard() {
  const { settings, loading: settingsLoading } = useSchoolSettings()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recent, setRecent] = useState<RecentMagang[]>([])
  const [recentLogbooks, setRecentLogbooks] = useState<RecentLogbook[]>([])
  const [activeDudis, setActiveDudis] = useState<ActiveDudi[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.admin.getDashboard()
        
        setStats(data.stats)
        setRecent(data.recent)
        setRecentLogbooks(data.recentLogbooks)
        setActiveDudis(data.activeDudis)
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[28px] font-extrabold text-[#0F172A] tracking-tight">Dashboard</h2>
          <div className="flex items-center gap-2">
            <p className="text-[14px] text-[#64748B] font-medium">
              Ringkasan aktivitas sistem magang — {settingsLoading ? <Skeleton className="h-4 w-32 inline-block align-middle" /> : <span>{settings?.namaSekolah || 'SMK Negeri 1 Surabaya'}</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E2E8F0] shadow-sm hover:border-[#BFDBFE] transition-colors rounded-[14px]">
          <CalendarDays className="w-4 h-4 text-[#94A3B8]" />
          <span className="text-[13px] font-medium text-[#475569]">
            {format(new Date(), "EEEE, dd MMMM yyyy", { locale: id })}
          </span>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard 
          loading={loading}
          title="Total Siswa" 
          value={stats?.totalSiswa || 0} 
          description="Seluruh siswa terdaftar dalam sistem" 
          icon={Users} 
        />
        <StatCard 
          loading={loading}
          title="Perusahaan Mitra" 
          value={stats?.totalDudi || 0} 
          description="DUDI aktif yang bermitra" 
          icon={Building2} 
        />
        <StatCard 
          loading={loading}
          title="Siswa Magang" 
          value={stats?.siswaMagang || 0} 
          description="Sedang aktif menjalani magang" 
          icon={GraduationCap} 
        />
        <StatCard 
          loading={loading}
          title="Logbook Hari Ini" 
          value={stats?.logbookHariIni || 0} 
          description="Laporan yang masuk hari ini" 
          icon={BookOpen} 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column (2/3 width) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Magang Terbaru Table */}
          <div className="bg-white border border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-md transition-all duration-300 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-[#2563EB]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#0F172A]">Magang Terbaru</h3>
                  <p className="text-[12px] text-[#64748B] font-medium mt-0.5">Penempatan magang terakhir</p>
                </div>
              </div>
              <Link href="/admin/magang" className="text-[13px] font-bold text-[#2563EB] hover:text-[#1E40AF] flex items-center gap-1 group">
                Lihat Semua <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    <th className="pb-3 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Siswa</th>
                    <th className="pb-3 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Perusahaan</th>
                    <th className="pb-3 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Periode</th>
                    <th className="pb-3 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <tr key={i}>
                        <td className="py-4 pr-4"><Skeleton className="h-4 w-32" /></td>
                        <td className="py-4 pr-4"><Skeleton className="h-4 w-40" /></td>
                        <td className="py-4 pr-4"><Skeleton className="h-4 w-28" /></td>
                        <td className="py-4 text-center"><Skeleton className="h-6 w-16 mx-auto rounded-full" /></td>
                      </tr>
                    ))
                  ) : recent.length > 0 ? (
                    recent.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors group">
                        <td className="py-4 pr-4">
                          <span className="text-[14px] font-bold text-[#0F172A]">{item.namaSiswa}</span>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="text-[13px] font-medium text-[#64748B] group-hover:text-[#0F172A] transition-colors">{item.dudi}</span>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-[#94A3B8]" />
                            <span className="text-[12px] font-medium text-[#64748B]">
                              {format(new Date(item.startDate), 'dd MMM')} - {format(new Date(item.endDate), 'dd MMM yyyy')}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <span className="inline-flex px-3 py-1 bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] rounded-full text-[11px] font-bold tracking-wide">
                            Aktif
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-[13px] font-medium text-[#94A3B8] italic bg-[#F8FAFC] rounded-xl mt-4 border border-dashed border-[#E2E8F0]">
                        Belum ada data magang terbaru.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Logbook Terbaru List */}
          <div className="bg-white border border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-md transition-all duration-300 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#2563EB]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#0F172A]">Logbook Terbaru</h3>
                  <p className="text-[12px] text-[#64748B] font-medium mt-0.5">Catatan aktivitas siswa</p>
                </div>
              </div>
              <Link href="/admin/logs" className="text-[13px] font-bold text-[#2563EB] hover:text-[#1E40AF] flex items-center gap-1 group">
                Lihat Semua <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="space-y-6 pt-2">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <Skeleton className="w-3 h-3 rounded-full mt-1.5 shrink-0" />
                    <div className="flex-1 space-y-2">
                       <Skeleton className="h-4 w-3/4" />
                       <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))
              ) : recentLogbooks.length > 0 ? (
                recentLogbooks.map((log) => {
                  let badgeStyle = "bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]"
                  if (log.status === 'Disetujui') {
                    badgeStyle = "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]"
                  } else if (log.status === 'Ditolak') {
                    badgeStyle = "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
                  }
                  
                  return (
                    <div key={log.id} className="flex items-start gap-4 group/log">
                       <div className="mt-1.5 w-2.5 h-2.5 rounded-full bg-[#3B82F6] shrink-0 outline outline-4 outline-[#EFF6FF] group-hover/log:outline-[#DBEAFE] transition-all" />
                       <div className="flex flex-col flex-1 gap-1">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                             <h4 className="text-[14px] font-bold text-[#0F172A] leading-snug group-hover/log:text-[#2563EB] transition-colors max-w-[85%]">{log.kegiatan}</h4>
                             <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-wider shrink-0 w-fit ${badgeStyle}`}>
                               {log.status === 'pending' ? 'Menunggu' : log.status}
                             </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                             <CalendarDays className="w-3.5 h-3.5 text-[#94A3B8]" />
                             <p className="text-[12px] font-medium text-[#94A3B8]">
                               {format(new Date(log.tanggal), 'eee, dd MMM yyyy', { locale: id })}
                             </p>
                          </div>
                          {log.kendala && (
                             <div className="mt-2 px-3 py-2 bg-[#FFFBEB] border border-[#FEF3C7] rounded-lg w-fit">
                               <p className="text-[12px] text-[#D97706] font-medium leading-relaxed">
                                 <span className="font-bold opacity-70">Kendala:</span> {log.kendala}
                               </p>
                             </div>
                          )}
                       </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-[13px] font-medium text-[#94A3B8] italic py-8 text-center bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0]">
                  Belum ada laporan logbook terbaru.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) - DUDI Aktif */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-[#E2E8F0] hover:border-[#BFDBFE] hover:shadow-md transition-all duration-300 rounded-2xl p-6 shadow-sm h-fit xl:sticky xl:top-28">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#2563EB]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#0F172A]">DUDI Aktif</h3>
                  <p className="text-[12px] text-[#64748B] font-medium mt-0.5">Mitra perusahaan</p>
                </div>
              </div>
              <Link href="/admin/dudi" className="text-[13px] font-bold text-[#2563EB] hover:text-[#1E40AF] flex items-center gap-1 group">
                Semua <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="space-y-3 pb-3 border-b border-[#F1F5F9] last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-6 w-12 rounded-lg" />
                    </div>
                    <Skeleton className="h-3 w-48" />
                  </div>
                ))
              ) : activeDudis.length > 0 ? (
                activeDudis.map((dudi, index) => (
                  <div key={dudi.id} className="group">
                    <div className="flex items-center justify-between py-1.5">
                       <div className="flex flex-col gap-1 pr-3">
                         <h4 className="text-[14px] font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors line-clamp-1">{dudi.namaPerusahaan}</h4>
                         <p className="text-[12px] text-[#94A3B8] font-medium line-clamp-1">{dudi.alamat}</p>
                       </div>
                       <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] rounded-lg shrink-0 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                         <Users className="w-3.5 h-3.5" />
                         <span className="text-[12px] font-bold">{dudi.jumlahSiswa}</span>
                       </div>
                    </div>
                    {index < activeDudis.length - 1 && <div className="h-px w-full bg-[#F1F5F9] mt-3" />}
                  </div>
                ))
              ) : (
                <div className="text-[13px] font-medium text-[#94A3B8] italic py-8 text-center bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0]">
                  Belum ada DUDI aktif.
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex justify-between items-center">
              <span className="text-[13px] font-medium text-[#64748B]">Total DUDI Partner</span>
              <span className="text-[16px] font-extrabold text-[#0F172A]">{activeDudis.length}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}


