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
  ChevronDown
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { ActivityLog, ActivityStats } from '@/types/admin'
import { api } from '@/lib/api'
import { StatCard } from '@/components/admin/StatCard'

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
          <h2 className="text-[28px] font-bold text-slate-800 tracking-tight">Activity Logs</h2>
          <p className="text-[14px] text-slate-500 mt-1 font-medium">Riwayat aktivitas admin di sistem</p>
        </div>
        <button 
          onClick={handleClearLogs}
          className="h-10 px-4 bg-red-600 text-white rounded-xl font-bold text-[13px] flex items-center gap-2 hover:bg-red-700 transition-all shadow-md shadow-red-200"
        >
          <Trash2 className="w-4 h-4" />
          Clear Logs
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard 
          title="Total Logs" 
          value={stats?.total || 0} 
          description="Total riwayat sistem" 
          icon={History} 
          color="text-[#00A3B8]"
        />
        <StatCard 
          title="Created" 
          value={stats?.created || 0} 
          description="Aktivitas penambahan" 
          icon={PlusCircle} 
          color="text-[#22C55E]"
        />
        <StatCard 
          title="Updated" 
          value={stats?.updated || 0} 
          description="Aktivitas perubahan" 
          icon={RefreshCw} 
          color="text-[#3B82F6]"
        />
        <StatCard 
          title="Deleted" 
          value={stats?.deleted || 0} 
          description="Aktivitas penghapusan" 
          icon={AlertCircle} 
          color="text-[#EF4444]"
        />
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl border-0 shadow-[0_4px_24px_rgba(0,0,0,0.02)] p-6 lg:p-8">
        <label className="flex items-center gap-2 text-[15px] font-bold text-slate-800 mb-5">
          <Filter className="w-4 h-4 text-[#00BCD4]" />
          Filters
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search logs..."
              className="w-full h-11 pl-10 pr-4 bg-slate-50 border-0 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative">
            <select 
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full h-11 px-4 bg-slate-50 border-0 rounded-xl text-[14px] font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/20 appearance-none cursor-pointer"
            >
              <option value="all">All Actions</option>
              <option value="create">Created</option>
              <option value="update">Updated</option>
              <option value="delete">Deleted</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="w-full h-11 px-4 bg-slate-50 border-0 rounded-xl text-[14px] font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/20 appearance-none cursor-pointer"
            >
              <option value="all">All Entities</option>
              <option value="SISWA">Siswa</option>
              <option value="GURU">Guru</option>
              <option value="DUDI">DUDI</option>
              <option value="MAGANG">Magang</option>
              <option value="LOGBOOK">Logbook</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bg-white rounded-2xl border-0 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-6 lg:p-8 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
              <History className="w-5 h-5 text-slate-400" />
            </div>
            <h3 className="text-[18px] font-bold text-slate-800">Activity Timeline</h3>
            <span className="px-2 py-0.5 bg-lime-500 text-white text-[10px] font-bold rounded-md ml-2 drop-shadow-sm">
              {logs.length} logs
            </span>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          {loading ? (
            <div className="py-20 text-center text-slate-400 font-medium">Memuat data log...</div>
          ) : logs.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-300">
              <RefreshCw className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-[15px] font-medium">Tidak ada activity logs</p>
            </div>
          ) : (
            <div className="space-y-6 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-50">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-12 group">
                  {/* Timeline Dot */}
                  <div className="absolute left-[14px] top-1 w-3 h-3 rounded-full bg-white border-2 border-[#00BCD4] z-10 group-hover:scale-125 transition-transform" />
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {new Date(log.createdAt).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="bg-slate-50/50 hover:bg-slate-50 rounded-2xl p-4 border border-transparent hover:border-slate-100 transition-all">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-2">
                        <div className="flex items-center gap-1.5 text-[14px] font-bold text-slate-800">
                          <User className="w-4 h-4 text-slate-400" />
                          {log.userName}
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wide leading-none ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                        <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500">
                          <Activity className="w-3.5 h-3.5" />
                          {log.entityType}
                        </div>
                      </div>
                      
                      <p className="text-[13px] text-slate-600 line-clamp-2 italic font-medium">
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
