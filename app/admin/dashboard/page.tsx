'use client'

import { 
  Users, 
  Building2, 
  GraduationCap, 
  BookOpen,
  CalendarDays,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { AdminStats, RecentMagang, RecentLogbook, ActiveDudi } from '@/types/admin'
import { format } from 'date-fns'
import { api } from '@/lib/api'
import { StatCard } from '@/components/admin/StatCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useSchoolSettings } from '@/components/providers/SchoolSettingsProvider'

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
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-[24px] sm:text-[28px] font-bold text-slate-800 tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-2">
          <p className="text-[13px] sm:text-[14px] text-slate-500 font-medium">
            Selamat datang di sistem pelaporan magang siswa
          </p>
          {settingsLoading ? <Skeleton className="h-4 w-32" /> : (
            <span className="text-[13px] sm:text-[14px] font-bold text-[#00A3B8]">
              {settings?.namaSekolah || 'SMK Negeri 1 Surabaya'}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard 
          loading={loading}
          title="Total Siswa" 
          value={stats?.totalSiswa || 0} 
          description="Seluruh siswa terdaftar" 
          icon={Users} 
          color="text-[#00A3B8]"
        />
        <StatCard 
          loading={loading}
          title="DUDI Partner" 
          value={stats?.totalDudi || 0} 
          description="Perusahaan mitra" 
          icon={Building2} 
          color="text-[#00A3B8]"
        />
        <StatCard 
          loading={loading}
          title="Siswa Magang" 
          value={stats?.siswaMagang || 0} 
          description="Sedang aktif magang" 
          icon={GraduationCap} 
          color="text-[#00A3B8]"
        />
        <StatCard 
          loading={loading}
          title="Logbook Hari Ini" 
          value={stats?.logbookHariIni || 0} 
          description="Laporan masuk hari ini" 
          icon={BookOpen} 
          color="text-[#00A3B8]"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Konten Kiri (2/3 width on desktop) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Magang Terbaru */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 lg:p-8 shadow-none">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-[#00A3B8]" />
              </div>
              <h3 className="text-[16px] font-bold text-slate-800">Magang Terbaru</h3>
            </div>

            <div className="space-y-4">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-50 bg-slate-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32 sm:w-48" />
                        <Skeleton className="h-3 w-24 sm:w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-16 rounded" />
                  </div>
                ))
              ) : (
                <>
                  {recent.map((item, idx) => (
                    <div key={idx} className="p-4 lg:p-5 rounded-xl border border-slate-100 bg-[#FAFAFA] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#00A3B8]/20 transition-all group">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 mt-1 sm:w-12 sm:h-12 bg-[#00A3B8] rounded-xl flex items-center justify-center shrink-0 shadow-none transition-transform group-hover:scale-105">
                          <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="flex flex-col gap-1.5 min-w-0">
                          <h4 className="font-bold text-slate-800 text-[14px] sm:text-[15px] truncate">{item.namaSiswa}</h4>
                          <p className="text-[13px] text-slate-600 font-medium truncate">{item.dudi}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[11px] sm:text-[12px] text-slate-500 font-medium tracking-wide">
                              {format(new Date(item.startDate), 'dd MMM yyyy')} - {format(new Date(item.endDate), 'dd MMM yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-[#EEFDF3] text-[#166534] rounded-[4px] text-[11px] font-bold w-fit uppercase tracking-wider shrink-0">
                        Aktif
                      </div>
                    </div>
                  ))}
                  {recent.length === 0 && (
                    <div className="text-[13px] font-medium text-slate-400 italic py-8 text-center bg-slate-50/30 rounded-2xl border border-dashed border-slate-200">
                      Belum ada data magang terbaru.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Logbook Terbaru */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 lg:p-8 shadow-none">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[#65A30D]" />
              </div>
              <h3 className="text-[16px] font-bold text-slate-800">Logbook Terbaru</h3>
            </div>
            
            <div className="space-y-4">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-50 bg-slate-50/30 flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-40 sm:w-60" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                      <Skeleton className="h-5 w-20 rounded" />
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {recentLogbooks.map((log) => (
                    <div key={log.id} className="p-4 lg:p-5 rounded-xl border border-slate-100 bg-[#FAFAFA] flex flex-col gap-3 hover:border-[#65A30D]/20 transition-all group">
                       <div className="flex items-start justify-between gap-4">
                         <div className="flex items-start gap-4 min-w-0">
                           <div className="w-10 h-10 bg-[#65A30D] rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                             <BookOpen className="w-5 h-5 text-white" />
                           </div>
                           <div className="flex flex-col gap-1.5 min-w-0">
                             <h4 className="font-bold text-slate-800 text-[14px] line-clamp-2 leading-tight">{log.kegiatan}</h4>
                             <div className="flex items-center gap-2 mt-0.5">
                               <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                               <span className="text-[12px] text-slate-500 font-medium">{format(new Date(log.tanggal), 'dd MMM yyyy')}</span>
                             </div>
                             {log.kendala && (
                               <div className="mt-1.5 p-2 bg-amber-50/50 rounded-lg border border-amber-100/50">
                                 <p className="text-[11px] sm:text-[12px] italic text-[#B45309] font-medium leading-relaxed">
                                   <span className="font-bold not-italic mr-1 text-[10px] uppercase">Kendala:</span> 
                                   {log.kendala}
                                 </p>
                               </div>
                             )}
                           </div>
                         </div>
                         <div className={`px-3 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                           log.status === 'Disetujui' ? 'bg-[#ECFCCB] text-[#4D7C0F]' :
                           log.status === 'pending' ? 'bg-[#FFFBEB] text-[#D97706]' :
                           'bg-[#FCE7F3] text-[#BE185D]'
                         }`}>
                           {log.status === 'pending' ? 'Pending' : log.status}
                         </div>
                       </div>
                    </div>
                  ))}
                  {recentLogbooks.length === 0 && (
                    <div className="text-[13px] font-medium text-slate-400 italic py-8 text-center bg-slate-50/30 rounded-2xl border border-dashed border-slate-200">
                      Belum ada laporan logbook terbaru.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Konten Kanan: DUDI Aktif (1/3 width on desktop) */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 lg:p-8 shadow-none h-fit xl:sticky xl:top-28">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-[#EA580C]" />
              </div>
              <h3 className="text-[16px] font-bold text-slate-800">DUDI Aktif</h3>
            </div>
            
            <div className="space-y-6">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-32" />
                    {i < 3 && <div className="h-px w-full bg-slate-50 mt-4" />}
                  </div>
                ))
              ) : (
                <>
                  {activeDudis.map((dudi, index) => (
                    <div key={dudi.id} className="flex flex-col gap-3 group">
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="text-[14px] font-bold text-slate-800 line-clamp-1 group-hover:text-[#EA580C] transition-colors">{dudi.namaPerusahaan}</h4>
                          <div className="px-2 py-0.5 bg-orange-50 text-[#EA580C] rounded-md text-[10px] font-bold shrink-0 border border-orange-100 transition-all group-hover:bg-[#EA580C] group-hover:text-white">
                            {dudi.jumlahSiswa} Siswa
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <p className="text-[12px] text-slate-500 font-medium leading-relaxed">{dudi.alamat}</p>
                          <p className="text-[12px] text-slate-400 font-medium flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                            {dudi.noTelp}
                          </p>
                        </div>
                      </div>
                      {index < activeDudis.length - 1 && <div className="h-px w-full bg-slate-50 mt-1" />}
                    </div>
                  ))}
                  {activeDudis.length === 0 && (
                    <div className="text-[13px] font-medium text-slate-400 italic py-8 text-center bg-slate-50/30 rounded-2xl border border-dashed border-slate-200">
                      Belum ada DUDI aktif.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}


