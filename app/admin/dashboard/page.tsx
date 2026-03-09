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

export default function AdminDashboard() {
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

  if (loading) return <div>Loading dashboard...</div>

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h2 className="text-[28px] font-bold text-slate-800 tracking-tight">Dashboard</h2>
        <p className="text-[14px] text-slate-500 mt-1 font-medium">Selamat datang di sistem pelaporan magang siswa SMK Negeri 1 Surabaya</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard 
          title="Total Siswa" 
          value={stats?.totalSiswa || 0} 
          description="Seluruh siswa terdaftar" 
          icon={Users} 
          color="text-[#00A3B8]"
        />
        <StatCard 
          title="DUDI Partner" 
          value={stats?.totalDudi || 0} 
          description="Perusahaan mitra" 
          icon={Building2} 
          color="text-[#00A3B8]"
        />
        <StatCard 
          title="Siswa Magang" 
          value={stats?.siswaMagang || 0} 
          description="Sedang aktif magang" 
          icon={GraduationCap} 
          color="text-[#00A3B8]"
        />
        <StatCard 
          title="Logbook Hari Ini" 
          value={stats?.logbookHariIni || 0} 
          description="Laporan masuk hari ini" 
          icon={BookOpen} 
          color="text-[#00A3B8]"
        />
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* Konten Kiri */}
        <div className="flex-1 space-y-6">
          
          {/* Magang Terbaru */}
          <div className="bg-white border-0 rounded-2xl p-6 lg:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-3 mb-6">
              <GraduationCap className="w-5 h-5 text-[#00A3B8]" />
              <h3 className="text-[16px] font-bold text-slate-800">Magang Terbaru</h3>
            </div>

            <div className="space-y-4">
              {recent.map((item, idx) => (
                <div key={idx} className="p-4 lg:p-5 rounded-xl border border-slate-100 bg-[#FAFAFA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 mt-1 sm:w-12 sm:h-12 bg-[#00A3B8] rounded-xl flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h4 className="font-bold text-slate-800 text-[14px] sm:text-[15px]">{item.namaSiswa}</h4>
                      <p className="text-[13px] text-slate-600 font-medium">{item.dudi}</p>
                      <div className="flex items-center gap-2 mt-1 blur-none">
                        <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[11px] sm:text-[12px] text-slate-500 font-medium tracking-wide">
                          {format(new Date(item.startDate), 'dd/MM/yyyy')} - {format(new Date(item.endDate), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-[#EEFDF3] text-[#166534] rounded-[4px] text-[11px] font-semibold w-fit">
                    Aktif
                  </div>
                </div>
              ))}
              {recent.length === 0 && (
                <div className="text-sm font-medium text-slate-500 italic py-4 text-center">
                  Belum ada data magang terbaru.
                </div>
              )}
            </div>
          </div>

          {/* Logbook Terbaru Dummy Section */}
          <div className="bg-white border-0 rounded-2xl p-6 lg:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-5 h-5 text-[#65A30D]" />
              <h3 className="text-[16px] font-bold text-slate-800">Logbook Terbaru</h3>
            </div>
            
            <div className="space-y-4">
              {recentLogbooks.map((log) => (
                <div key={log.id} className="p-4 lg:p-5 rounded-xl border border-slate-100 bg-[#FAFAFA] flex flex-col gap-3">
                   <div className="flex items-start justify-between gap-4">
                     <div className="flex items-start gap-4">
                       <div className="w-10 h-10 bg-[#65A30D] rounded-xl flex items-center justify-center shrink-0">
                         <BookOpen className="w-5 h-5 text-white" />
                       </div>
                       <div className="flex flex-col gap-1.5">
                         <h4 className="font-bold text-slate-800 text-[14px] line-clamp-2">{log.kegiatan}</h4>
                         <div className="flex items-center gap-2 mt-0.5">
                           <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                           <span className="text-[12px] text-slate-500 font-medium">{format(new Date(log.tanggal), 'dd/MM/yyyy')}</span>
                         </div>
                         {log.kendala && (
                          <p className="text-[12px] italic text-[#B45309] font-medium mt-1">Kendala: {log.kendala}</p>
                         )}
                       </div>
                     </div>
                     <div className={`px-3 py-1 rounded-[4px] text-[11px] font-semibold shrink-0 ${
                       log.status === 'Disetujui' ? 'bg-[#ECFCCB] text-[#4D7C0F]' :
                       log.status === 'pending' ? 'bg-[#854D0E] text-white' :
                       'bg-[#FCE7F3] text-[#BE185D]'
                     }`}>
                       {log.status === 'pending' ? 'Pending' : log.status}
                     </div>
                   </div>
                </div>
              ))}
              {recentLogbooks.length === 0 && (
                <div className="text-sm font-medium text-slate-500 italic py-4 text-center">
                  Belum ada laporan logbook terbaru.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Konten Kanan: DUDI Aktif */}
        <div className="w-full xl:w-[350px] shrink-0">
          <div className="bg-white border-0 rounded-2xl p-6 lg:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] sticky top-28">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-5 h-5 text-[#EA580C]" />
              <h3 className="text-[16px] font-bold text-slate-800">DUDI Aktif</h3>
            </div>
            
            <div className="space-y-6">
              {activeDudis.map((dudi, index) => (
                <div key={dudi.id} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-[14px] font-bold text-slate-800 line-clamp-1">{dudi.namaPerusahaan}</h4>
                      <div className="px-2.5 py-1 bg-[#854D0E] text-white rounded text-[11px] font-semibold shrink-0">
                        {dudi.jumlahSiswa} siswa
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[12px] text-slate-500 font-medium truncate">{dudi.alamat}</p>
                      <p className="text-[12px] text-slate-500 font-medium">{dudi.noTelp}</p>
                    </div>
                  </div>
                  {index < activeDudis.length - 1 && <div className="h-px w-full bg-slate-100" />}
                </div>
              ))}
              {activeDudis.length === 0 && (
                <div className="text-sm font-medium text-slate-500 italic py-4 text-center">
                  Belum ada dudi aktif.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}


