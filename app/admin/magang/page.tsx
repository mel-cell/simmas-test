'use client'

import { 
  Briefcase, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock,
  XCircle,
  GraduationCap,
  Building2,
  User,
  Calendar,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { InternshipStats, RecentMagang } from '@/types/admin'
import { api } from '@/lib/api'
import { StatCard } from '@/components/admin/StatCard'
import { Skeleton } from '@/components/ui/skeleton'
import { MagangModal } from '@/components/admin/magang/MagangModal'
import { DeleteConfirmModal } from '@/components/admin/magang/DeleteConfirmModal'

export default function ManajemenMagang() {
  const [stats, setStats] = useState<InternshipStats | null>(null)
  const [internships, setInternships] = useState<RecentMagang[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('semua')

  const [isMagangModalOpen, setIsMagangModalOpen] = useState(false)
  const [currentInternship, setCurrentInternship] = useState<RecentMagang | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [internshipToDelete, setInternshipToDelete] = useState<RecentMagang | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.admin.getInternships({
        query: searchQuery,
        status: statusFilter
      })
      setStats(data.stats)
      setInternships(data.internships)
    } catch (error) {
      console.error("Failed to load internship data:", error)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, statusFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAdd = () => {
    setCurrentInternship(null)
    setIsMagangModalOpen(true)
  }

  const handleEdit = (magang: RecentMagang) => {
    setCurrentInternship(magang)
    setIsMagangModalOpen(true)
  }

  const handleDeleteClick = (magang: RecentMagang) => {
    setInternshipToDelete(magang)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!internshipToDelete) return
    try {
      setDeleting(true)
      const res = await api.admin.deleteInternship(internshipToDelete.id)
      if (res.success) {
        setIsDeleteModalOpen(false)
        loadData()
      }
    } catch (error) {
      console.error('Failed to delete magang:', error)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] sm:text-[28px] font-bold text-slate-800 tracking-tight">Manajemen Magang</h2>
          <p className="text-[13px] sm:text-[14px] text-slate-500 mt-1 font-medium italic sm:not-italic">Kelola penempatan dan monitoring magang siswa</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard 
          loading={loading && !stats}
          title="Total Magang" 
          value={stats?.total || 0} 
          description="Total riwayat penempatan" 
          icon={Briefcase} 
          color="text-[#00BCD4]"
        />
        <StatCard 
          loading={loading && !stats}
          title="Sedang Aktif" 
          value={stats?.aktif || 0} 
          description="Siswa sedang PKL" 
          icon={Clock} 
          color="text-[#F59E0B]"
        />
        <StatCard 
          loading={loading && !stats}
          title="Selesai" 
          value={stats?.selesai || 0} 
          description="Berhasil menyelesaikan PKL" 
          icon={CheckCircle2} 
          color="text-[#22C55E]"
        />
        <StatCard 
          loading={loading && !stats}
          title="Dibatalkan" 
          value={stats?.dibatalkan || 0} 
          description="Penempatan yang dibatalkan" 
          icon={XCircle} 
          color="text-[#EF4444]"
        />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-none overflow-hidden">
        <div className="p-5 sm:p-6 lg:p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-slate-400" />
            </div>
            <h3 className="text-[16px] sm:text-[18px] font-bold text-slate-800">Daftar Penempatan</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={handleAdd}
              className="h-10 sm:h-11 px-5 sm:px-6 bg-[#00BCD4] text-white rounded-xl font-bold text-[13px] sm:text-[14px] flex items-center gap-2 hover:bg-[#00acc1] transition-all border border-[#00BCD4]/10 shadow-lg shadow-cyan-500/20 active:scale-95 group"
            >
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
              Tambah Magang
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-5 sm:px-6 lg:px-8 py-5 bg-slate-50/50 border-b border-slate-50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Cari siswa, DUDI, atau guru..."
              className="w-full h-10 sm:h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-4 focus:ring-[#00BCD4]/10 focus:border-[#00BCD4] transition-all placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="relative min-w-[180px]">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 sm:h-11 px-4 bg-white border border-slate-200 rounded-xl text-[14px] font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-[#00BCD4]/10 appearance-none cursor-pointer"
            >
              <option value="semua">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="selesai">Selesai</option>
              <option value="dibatalkan">Dibatalkan</option>
              <option value="menunggu">Menunggu</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-white">
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Siswa</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Lokasi DUDI</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Pembimbing</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider text-center flex items-center gap-1 justify-center"><Calendar className="w-3 h-3" /> Periode</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-5"><Skeleton className="h-4 w-40" /></td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-7 h-7 rounded" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-7 h-7 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </td>
                    <td className="px-6 py-5"><div className="flex justify-center"><Skeleton className="h-4 w-32" /></div></td>
                    <td className="px-6 py-5"><div className="flex justify-center"><Skeleton className="h-6 w-20 rounded" /></div></td>
                    <td className="px-6 py-5"><div className="flex justify-end gap-2"><Skeleton className="w-8 h-8" /><Skeleton className="w-8 h-8" /></div></td>
                  </tr>
                ))
              ) : internships.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400 font-medium bg-slate-50/20">
                    <div className="flex flex-col items-center gap-2">
                       <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                        <Briefcase className="w-8 h-8 text-slate-300" />
                      </div>
                      <span className="text-[14px] font-bold text-slate-400">Tidak ada data penempatan ditemukan.</span>
                    </div>
                  </td>
                </tr>
              ) : internships.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-6 py-5">
                    <span className="text-[13px] sm:text-[14px] font-bold text-slate-800">{m.namaSiswa}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200 group-hover:bg-[#00BCD4]/10 group-hover:border-[#00BCD4]/20 transition-colors">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#00BCD4]" />
                      </div>
                      <span className="text-[12px] sm:text-[13px] font-semibold text-slate-700">{m.dudi}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <span className="text-[12px] sm:text-[13px] font-medium text-slate-600">{m.pembimbing}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 mr-2" />
                      <span className="text-[11px] font-bold text-slate-600">{m.startDate} — {m.endDate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider leading-none shadow-sm border ${
                        m.status === 'aktif' ? 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]' :
                        m.status === 'selesai' ? 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]' :
                        m.status === 'dibatalkan' ? 'bg-red-50 text-red-500 border-red-100' :
                        'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {m.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => handleEdit(m)}
                         className="w-9 h-9 rounded-xl flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-all active:scale-90 border border-transparent hover:border-blue-100" 
                         title="Edit"
                       >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                         onClick={() => handleDeleteClick(m)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50 transition-all active:scale-90 border border-transparent hover:border-red-100" 
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div className="px-6 lg:px-8 py-6 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50/20">
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-slate-500 font-bold">Tampilkan</span>
            <select className="h-9 px-3 bg-white border border-slate-200 rounded-xl text-[13px] font-bold focus:outline-none focus:ring-4 focus:ring-[#00BCD4]/10 appearance-none cursor-pointer">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span className="text-[13px] text-slate-500 font-bold">data</span>
          </div>

           <div className="flex items-center gap-4">
            <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-800 hover:border-slate-300 transition-all shadow-sm active:scale-95 disabled:opacity-30" disabled>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-black text-slate-800">Halaman 1</span>
              <span className="text-[14px] text-slate-400 font-bold">dari 1</span>
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-800 hover:border-slate-300 transition-all shadow-sm active:scale-95 disabled:opacity-30" disabled>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <MagangModal 
        isOpen={isMagangModalOpen}
        onClose={() => setIsMagangModalOpen(false)}
        onSuccess={loadData}
        internship={currentInternship}
      />

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus"
        message={`Yakin ingin menghapus penempatan magang siswa ${internshipToDelete?.namaSiswa}? Aksi ini tidak dapat dibatalkan.`}
        loading={deleting}
      />
    </div>
  )
}
