'use client'

import { 
  Users, 
  Building2, 
  GraduationCap, 
  BookOpen,
  CalendarDays,
  ArrowRight
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { adminService } from '@/services/adminService'
import { useState, useEffect } from 'react'
import { AdminStats, RecentMagang } from '@/types/admin'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recent, setRecent] = useState<RecentMagang[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const s = await adminService.getDashboardStats()
      const r = await adminService.getRecentMagang()
      setStats(s)
      setRecent(r)
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return <div>Loading dashboard...</div>

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h2>
        <p className="text-slate-500 mt-1">Selamat datang di sistem pelaporan magang siswa SMK Negeri 1 Surabaya</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Siswa" 
          value={stats?.totalSiswa || 0} 
          description="Seluruh siswa terdaftar" 
          icon={Users} 
          color="bg-blue-600"
        />
        <StatCard 
          title="DUDI Partner" 
          value={stats?.totalDudi || 0} 
          description="Perusahaan mitra" 
          icon={Building2} 
          color="bg-cyan-600"
        />
        <StatCard 
          title="Siswa Magang" 
          value={stats?.siswaMagang || 0} 
          description="Sedang aktif magang" 
          icon={GraduationCap} 
          color="bg-indigo-600"
        />
        <StatCard 
          title="Logbook Hari Ini" 
          value={stats?.logbookHariIni || 0} 
          description="Laporan masuk hari ini" 
          icon={BookOpen} 
          color="bg-emerald-600"
        />
      </div>

      <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Magang Terbaru</h3>
          </div>
          <Button variant="ghost" className="text-blue-600 font-bold gap-2 text-sm hover:bg-blue-50">
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {recent.map((item) => (
            <div key={item.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:border-blue-200 transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-[15px]">{item.namaSiswa}</h4>
                    <p className="text-xs text-slate-500 font-medium">{item.dudi}</p>
                    <div className="flex items-center gap-2 mt-1 blur-none">
                      <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[11px] text-slate-400 font-semibold tracking-wide">
                        {format(new Date(item.startDate), 'dd/MM/yyyy')} - {format(new Date(item.endDate), 'dd/MM/yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="px-3.5 py-1.5 bg-emerald-100 text-emerald-600 rounded-lg text-xs font-black uppercase tracking-widest shadow-sm shadow-emerald-50">
                  {item.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, description, icon: Icon, color }: any) {
  return (
    <Card className="border-none shadow-xl shadow-slate-100 rounded-3xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
      <CardContent className="p-8">
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</p>
            <div>
              <h4 className="text-[42px] font-black text-slate-900 leading-none">{value}</h4>
              <p className="text-xs text-slate-400 font-semibold mt-2">{description}</p>
            </div>
          </div>
          <div className={`p-4 ${color} rounded-2xl shadow-lg shadow-blue-100 group-hover:rotate-12 transition-transform duration-500`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
