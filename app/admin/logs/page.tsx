'use client'

import { 
  History, 
  Search, 
  Trash2, 
  PlusCircle,
  RefreshCw,
  AlertCircle,
  Filter,
  User,
  Activity,
  ChevronDown,
  Clock
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { ActivityLog, ActivityStats } from '@/types/admin'
import { api } from '@/lib/api'
import { StatCard } from '@/components/admin/StatCard'
import { Skeleton } from '@/components/ui/skeleton'

export default function ActivityLogs() {
  const [stats, setStats] = useState<ActivityStats | null>(null)
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [entityFilter, setEntityFilter] = useState('all')

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await api.admin.getLogs({
        query: searchQuery,
        action: actionFilter,
        entity: entityFilter
      })
      setStats(data.stats)
      setLogs(data.logs)
    } catch {
      console.error("Failed to load activity logs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, actionFilter, entityFilter])

  const handleClearLogs = async () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua log aktivitas? Tindakan ini tidak dapat dibatalkan.")) {
      try {
        await api.admin.clearLogs()
        loadData()
      } catch {
        alert("Gagal menghapus log")
      }
    }
  }

  const getActionColor = (action: string) => {
    const act = action.toLowerCase()
    if (act.includes('create') || act.includes('tambah')) return 'bg-green-50 text-green-600 border-green-100'
    if (act.includes('update') || act.includes('edit') || act.includes('ubah')) return 'bg-blue-50 text-blue-600 border-blue-100'
    if (act.includes('delete') || act.includes('hapus')) return 'bg-red-50 text-red-600 border-red-100'
    return 'bg-slate-50 text-slate-600 border-slate-100'
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] sm:text-[28px] font-bold text-slate-800 tracking-tight">Log Aktivitas</h2>
          <p className="text-[13px] sm:text-[14px] text-slate-500 mt-1 font-medium italic sm:not-italic">Pantau seluruh perubahan data di sistem secara real-time</p>
        </div>
        <button 
          onClick={handleClearLogs}
          className="h-10 px-4 bg-red-600 text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-red-700 transition-all border border-red-500/20 shadow-none sm:w-auto w-full"
        >
          <Trash2 className="w-4 h-4" />
          Bersihkan Semua Log
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard 
          loading={loading && !stats}
          title="Total Logs" 
          value={stats?.total || 0} 
          description="Total riwayat sistem" 
          icon={History} 
          color="text-[#00A3B8]"
        />
        <StatCard 
          loading={loading && !stats}
          title="Created" 
          value={stats?.created || 0} 
          description="Aktivitas penambahan" 
          icon={PlusCircle} 
          color="text-[#22C55E]"
        />
        <StatCard 
          loading={loading && !stats}
          title="Updated" 
          value={stats?.updated || 0} 
          description="Aktivitas perubahan" 
          icon={RefreshCw} 
          color="text-[#3B82F6]"
        />
        <StatCard 
          loading={loading && !stats}
          title="Deleted" 
          value={stats?.deleted || 0} 
          description="Aktivitas penghapusan" 
          icon={AlertCircle} 
          color="text-[#EF4444]"
        />
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 lg:p-8 shadow-none">
        <label className="flex items-center gap-2 text-[15px] font-bold text-slate-800 mb-5">
          <Filter className="w-4 h-4 text-[#00BCD4]" />
          Filter pencarian
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Cari detail log..."
              className="w-full h-11 pl-10 pr-4 bg-slate-50 border-0 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative">
            <select 
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full h-11 px-4 bg-slate-50 border-0 rounded-xl text-[13px] sm:text-[14px] font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/20 appearance-none cursor-pointer"
            >
              <option value="all">Semua Tindakan</option>
              <option value="create">Penambahan Data</option>
              <option value="update">Pembaruan Data</option>
              <option value="delete">Penghapusan Data</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative sm:col-span-2 md:col-span-1">
            <select 
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="w-full h-11 px-4 bg-slate-50 border-0 rounded-xl text-[13px] sm:text-[14px] font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/20 appearance-none cursor-pointer"
            >
              <option value="all">Semua Entitas</option>
              <option value="SISWA">Pihak Siswa</option>
              <option value="GURU">Pihak Guru</option>
              <option value="DUDI">Pihak Industri</option>
              <option value="MAGANG">Data Magang</option>
              <option value="LOGBOOK">Catatan Logbook</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-none overflow-hidden">
        <div className="p-5 sm:p-6 lg:p-8 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
              <History className="w-5 h-5 text-slate-400" />
            </div>
            <h3 className="text-[16px] sm:text-[18px] font-bold text-slate-800">Garis Waktu Aktivitas</h3>
            {!loading && (
              <span className="hidden sm:inline-block px-2 py-0.5 bg-[#00BCD4] text-white text-[10px] font-bold rounded-md ml-2 drop-shadow-sm">
                {logs.length} entri ditemukan
              </span>
            )}
          </div>
        </div>

        <div className="p-5 sm:p-6 lg:p-8">
          {loading ? (
            <div className="space-y-8 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-50">
               {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="relative pl-12">
                    <Skeleton className="absolute left-[14px] top-1 w-3 h-3 rounded-full border-2 border-white z-10" />
                    <div className="space-y-3">
                      <Skeleton className="h-3 w-32" />
                      <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-50 space-y-3">
                        <div className="flex gap-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-20" /></div>
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  </div>
               ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-300">
              <RefreshCw className="w-12 h-12 mb-4 opacity-10" />
              <p className="text-[15px] font-medium">Belum ada catatan aktivitas sistem.</p>
            </div>
          ) : (
            <div className="space-y-10 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-12 group">
                  {/* Timeline Dot */}
                  <div className="absolute left-[14px] top-1 w-3 h-3 rounded-full bg-white border-2 border-[#00BCD4] z-10 group-hover:scale-125 transition-transform shadow-sm" />
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 transition-opacity duration-300">
                      <Clock className="w-3 h-3 text-slate-300" />
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(log.createdAt).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="bg-slate-50/30 hover:bg-white rounded-2xl p-4 sm:p-5 border border-slate-100/50 hover:border-[#00BCD4]/20 hover:shadow-xl hover:shadow-[#00BCD4]/5 transition-all duration-300 group-hover:-translate-y-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3">
                        <div className="flex items-center gap-2 text-[14px] font-bold text-slate-800">
                          <div className="w-6 h-6 rounded-full bg-white border border-slate-100 flex items-center justify-center">
                             <User className="w-3 h-3 text-slate-400" />
                          </div>
                          {log.userName}
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border uppercase tracking-widest leading-none ${getActionColor(log.action)} shadow-sm`}>
                          {log.action}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-50">
                          <Activity className="w-3 h-3 text-[#00BCD4]" />
                          {log.entityType}
                        </div>
                      </div>
                      
                      <p className="text-[13px] text-slate-600 leading-relaxed font-medium italic border-l-2 border-slate-200 pl-3 py-1">
                        &quot;{log.details}&quot;
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
