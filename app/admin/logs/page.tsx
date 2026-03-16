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
  Clock,
  Plus,
  Edit2,
  Trash,
  Calendar
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

  const getActionTheme = (action: string) => {
    const act = action.toLowerCase()
    if (act.includes('create') || act.includes('tambah') || act.includes('add')) {
      return {
        bg: 'bg-[#ECFDF5]', 
        text: 'text-[#059669]',
        border: 'border-[#D1FAE5]',
        icon: Plus,
        iconBg: 'bg-[#ECFDF5]',
        iconColor: 'text-[#10B981]'
      }
    }
    if (act.includes('update') || act.includes('edit') || act.includes('ubah') || act.includes('patch')) {
      return {
        bg: 'bg-[#EFF6FF]', 
        text: 'text-[#2563EB]',
        border: 'border-[#DBEAFE]',
        icon: Edit2,
        iconBg: 'bg-[#EFF6FF]',
        iconColor: 'text-[#3B82F6]'
      }
    }
    if (act.includes('delete') || act.includes('hapus') || act.includes('remove')) {
      return {
        bg: 'bg-[#FEF2F2]', 
        text: 'text-[#DC2626]',
        border: 'border-[#FEE2E2]',
        icon: Trash,
        iconBg: 'bg-[#FEF2F2]',
        iconColor: 'text-[#EF4444]'
      }
    }
    return {
      bg: 'bg-slate-50', 
      text: 'text-slate-600',
      border: 'border-slate-100',
      icon: Activity,
      iconBg: 'bg-slate-50',
      iconColor: 'text-slate-400'
    }
  }

  const getEntityColor = (entity: string) => {
    const ent = entity.toUpperCase()
    if (ent === 'GURU') return 'bg-[#EEF2FF] text-[#4F46E5] border-[#E0E7FF]'
    if (ent === 'SISWA') return 'bg-[#F0FDFA] text-[#0D9488] border-[#CCFBF1]'
    if (ent === 'DUDI') return 'bg-[#FFF7ED] text-[#EA580C] border-[#FFEDD5]'
    if (ent === 'MAGANG') return 'bg-[#FAF5FF] text-[#9333EA] border-[#F3E8FF]'
    return 'bg-slate-50 text-slate-500 border-slate-100'
  }

  const formatLogTitle = (log: ActivityLog) => {
    const actionMap: Record<string, string> = {
      'Create': 'Menambahkan',
      'Update': 'Mengupdate',
      'Delete': 'Menghapus'
    }

    const entityMap: Record<string, string> = {
      'GURU': 'data guru',
      'SISWA': 'data siswa',
      'DUDI': 'data DUDI',
      'MAGANG': 'data magang',
      'PENGGUNA': 'data pengguna',
      'PENGATURAN': 'pengaturan sekolah'
    }

    const actionText = actionMap[log.action] || log.action
    const entityText = entityMap[log.entityType] || log.entityType.toLowerCase()
    
    // Attempt to extract a name if available in details
    let identifier = ''
    if (log.details && typeof log.details === 'object') {
      const d = log.details as Record<string, unknown>
      identifier = (d.nama || d.full_name || d.namaPerusahaan || d.nama_perusahaan || d.title || '') as string
    }

    const titlePrefix = `${actionText} ${entityText}${identifier ? ': ' + identifier : ''}`
    
    // Detail string
    let detailStr = ''
    if (log.action === 'Update' && log.details && typeof log.details === 'object') {
      const d = log.details as Record<string, unknown>
      const relevantFields = Object.entries(d)
        .filter(([key]) => !['id', 'updated_at', 'created_at', 'password'].includes(key))
        .map(([key, value]) => {
          const fieldName = key.toUpperCase()
          return `${fieldName}: ${String(value)}`
        })
      if (relevantFields.length > 0) {
        detailStr = ` | Detail: ${relevantFields.slice(0, 2).join(', ')}`
        if (relevantFields.length > 2) detailStr += '...'
      }
    } else if (log.action === 'Create' && log.details && typeof log.details === 'object') {
       const d = log.details as Record<string, unknown>
       const nis = (d.nis || d.nip || d.npsn || '') as string
       if (nis) detailStr = ` | Detail: ${d.nis ? 'NIS' : (d.nip ? 'NIP' : 'NPSN')}: ${nis}`
    } else if (log.action === 'Delete' && log.details && typeof log.details === 'object') {
       const d = log.details as Record<string, unknown>
       const nis = (d.nis || d.nip || d.id || '') as string
       if (nis) detailStr = ` | Detail: ${d.nis ? 'NIS' : (d.nip ? 'NIP' : 'ID')}: ${nis}`
    }

    return (
      <span className="text-[14px] sm:text-[15px] font-medium text-slate-800 leading-snug">
        {titlePrefix}
        {detailStr && <span className="text-slate-500 font-medium">{detailStr}</span>}
      </span>
    )
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] sm:text-[28px] font-medium text-slate-800 tracking-tight">Log Aktivitas</h2>
          <p className="text-[13px] sm:text-[14px] text-slate-500 mt-1 font-medium italic sm:not-italic">Pantau seluruh perubahan data di sistem secara real-time</p>
        </div>
        <button 
          onClick={handleClearLogs}
          className="h-10 px-4 bg-red-600 text-white rounded-xl font-medium text-[13px] flex items-center justify-center gap-2 hover:bg-red-700 transition-all border border-red-500/20 shadow-none sm:w-auto w-full"
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
        <label className="flex items-center gap-2 text-[15px] font-medium text-slate-800 mb-5">
          <Filter className="w-4 h-4 text-[#2563EB]" />
          Filter pencarian
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Cari detail log..."
              className="w-full h-11 pl-10 pr-4 bg-slate-50 border-0 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative">
            <select 
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full h-11 px-4 bg-slate-50 border-0 rounded-xl text-[13px] sm:text-[14px] font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 appearance-none cursor-pointer"
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
              className="w-full h-11 px-4 bg-slate-50 border-0 rounded-xl text-[13px] sm:text-[14px] font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 appearance-none cursor-pointer"
            >
              <option value="all">Semua Entitas</option>
              <option value="SISWA">Siswa</option>
              <option value="GURU">Guru</option>
              <option value="DUDI">DUDI / Industri</option>
              <option value="MAGANG">Magang</option>
              <option value="PENGGUNA">Pengguna</option>
              <option value="PENGATURAN">Pengaturan</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                <History className="w-5 h-5 text-[#2563EB]" />
              </div>
              <h3 className="text-[18px] font-medium text-slate-800">Garis Waktu Aktivitas</h3>
           </div>
           {!loading && (
              <span className="px-3 py-1 bg-[#EEF2FF] text-[#4F46E5] text-[12px] font-medium rounded-full border border-[#E0E7FF]">
                {logs.length} entri ditemukan
              </span>
           )}
        </div>

        {loading ? (
          <div className="space-y-4">
             {Array(5).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-[24px] p-6 flex gap-4 border border-slate-100 shadow-sm">
                  <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                  <div className="space-y-3 w-full text-left">
                    <Skeleton className="h-5 w-3/4" />
                    <div className="flex gap-4"><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-20" /></div>
                  </div>
                </div>
             ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-[32px] py-20 flex flex-col items-center justify-center text-slate-300 border border-slate-100 shadow-sm">
            <RefreshCw className="w-16 h-16 mb-4 opacity-10 animate-spin-slow" />
            <p className="text-[16px] font-medium text-slate-400 tracking-tight">Belum ada catatan aktivitas sistem.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => {
              const theme = getActionTheme(log.action)
              return (
                <div 
                  key={log.id} 
                  className="group bg-white rounded-[24px] px-6 py-5 border border-slate-100 hover:border-[#2563EB]/20 hover:shadow-xl hover:shadow-[#2563EB]/5 transition-all duration-300 flex items-center gap-6"
                >
                  {/* Left Icon Area - Matching Image Size and Circle Style */}
                  <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center ${theme.iconBg} ${theme.iconColor} transition-transform group-hover:scale-110 shadow-sm border border-white`}>
                    <theme.icon className="w-5 h-5" />
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 min-w-0">
                    <div className="mb-2">
                       {formatLogTitle(log)}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-5">
                      {/* Entity Badge - Styled precisely like GURU/SISWA badges in image */}
                      <span className={`px-3 py-0.5 rounded-[6px] text-[10px] font-black uppercase tracking-widest border shadow-sm ${getEntityColor(log.entityType)}`}>
                        {log.entityType}
                      </span>

                      {/* Action Label */}
                      <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-400">
                        <span className="text-slate-400/60">Action:</span>
                        <span className="text-slate-500/80 uppercase tracking-wide">{log.action}</span>
                      </div>

                      {/* User Info */}
                      <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-400/80">
                        <User className="w-3.5 h-3.5 opacity-50" />
                        <span className="text-slate-500/80">{log.userName}</span>
                      </div>

                      {/* Time Info */}
                      <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-400/80">
                        <Calendar className="w-3.5 h-3.5 opacity-50" />
                        <span className="text-slate-500/80 uppercase">
                          {new Date(log.createdAt).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          }).replace('.', ':')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
