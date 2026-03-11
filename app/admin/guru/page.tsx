'use client'

import { 
  Users, 
  Search, 
  Plus, 
  UserCheck,
  Edit2,
  Trash2,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Award,
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { TeacherStats, GuruData } from '@/types/admin'
import { api } from '@/lib/api'
import { StatCard } from '@/components/admin/StatCard'
import { Skeleton } from '@/components/ui/skeleton'
import { GuruModal } from '@/components/admin/guru/GuruModal'
import { DeleteConfirmModal } from '@/components/admin/guru/DeleteConfirmModal'

export default function ManajemenGuru() {
  const [stats, setStats] = useState<TeacherStats | null>(null)
  const [teachers, setTeachers] = useState<GuruData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('semua')

  // Modal State
  const [isGuruModalOpen, setIsGuruModalOpen] = useState(false)
  const [currentGuru, setCurrentGuru] = useState<GuruData | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [guruToDelete, setGuruToDelete] = useState<GuruData | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.admin.getTeachers({
        query: searchQuery,
        status: statusFilter
      })
      setStats(data.stats)
      setTeachers(data.teachers)
    } catch (error) {
      console.error("Failed to load teacher data:", error)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, statusFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAdd = () => {
    setCurrentGuru(null)
    setIsGuruModalOpen(true)
  }

  const handleEdit = (guru: GuruData) => {
    setCurrentGuru(guru)
    setIsGuruModalOpen(true)
  }

  const handleDeleteClick = (guru: GuruData) => {
    setGuruToDelete(guru)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!guruToDelete) return
    try {
      setDeleting(true)
      const res = await api.admin.deleteTeacher(guruToDelete.id)
      if (res.success) {
        setIsDeleteModalOpen(false)
        loadData()
      }
    } catch (error) {
      console.error('Failed to delete teacher:', error)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] sm:text-[28px] font-bold text-slate-800 tracking-tight">Manajemen Guru</h2>
          <p className="text-[13px] sm:text-[14px] text-slate-500 mt-1 font-medium italic sm:not-italic">Kelola data guru pembimbing magang</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard 
          loading={loading && !stats}
          title="Total Guru" 
          value={stats?.total || 0} 
          description="Guru pembimbing terdaftar" 
          icon={Users} 
          color="text-[#00BCD4]"
        />
        <StatCard 
          loading={loading && !stats}
          title="Guru Aktif" 
          value={stats?.aktif || 0} 
          description="Status siap membimbing" 
          icon={UserCheck} 
          color="text-[#22C55E]"
        />
        <StatCard 
          loading={loading && !stats}
          title="Total Bimbingan" 
          value={stats?.totalBimbingan || 0} 
          description="Siswa dalam pengawasan" 
          icon={BookOpen} 
          color="text-[#00BCD4]"
        />
        <StatCard 
          loading={loading && !stats}
          title="Rata-rata Siswa" 
          value={stats?.rataRataSiswa || 0} 
          description="Estimasi siswa per guru" 
          icon={Award} 
          color="text-[#EA580C]"
        />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-none overflow-hidden">
        <div className="p-5 sm:p-6 lg:p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-400" />
            </div>
            <h3 className="text-[16px] sm:text-[18px] font-bold text-slate-800">Data Guru</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={handleAdd}
              className="h-10 sm:h-11 px-5 sm:px-6 bg-[#00BCD4] text-white rounded-xl font-bold text-[13px] sm:text-[14px] flex items-center gap-2 hover:bg-[#00acc1] transition-all border border-[#00BCD4]/10 shadow-lg shadow-cyan-500/20 active:scale-95 group"
            >
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
              Tambah Guru
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-5 sm:px-6 lg:px-8 py-5 bg-slate-50/50 border-b border-slate-50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Cari guru (Nama/NIP)..."
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
              <option value="aktif">Status Aktif</option>
              <option value="non-aktif">Status Non-Aktif</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-white">
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">NIP</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Nama Guru</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Mata Pelajaran</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Kontak</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider text-center">Siswa</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-5"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                    </td>
                    <td className="px-6 py-5"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-40" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </td>
                    <td className="px-6 py-5"><div className="flex justify-center"><Skeleton className="h-6 w-16" /></div></td>
                    <td className="px-6 py-5"><div className="flex justify-center"><Skeleton className="h-6 w-20" /></div></td>
                    <td className="px-6 py-5"><div className="flex justify-end gap-2"><Skeleton className="w-8 h-8" /><Skeleton className="w-8 h-8" /></div></td>
                  </tr>
                ))
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-400 font-medium bg-slate-50/20">
                    <div className="flex flex-col items-center gap-2">
                       <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                        <Users className="w-8 h-8 text-slate-300" />
                      </div>
                      <span className="text-[14px] font-bold text-slate-400">Tidak ada data guru ditemukan.</span>
                    </div>
                  </td>
                </tr>
              ) : teachers.map((guru) => (
                <tr key={guru.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-6 py-5">
                    <span className="text-[13px] sm:text-[14px] font-bold text-slate-700 font-mono tracking-tight">{guru.nip}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#00BCD4]/10 flex items-center justify-center border border-[#00BCD4]/20 group-hover:scale-110 transition-transform">
                        <UserCheck className="w-4 h-4 text-[#00BCD4]" />
                      </div>
                      <span className="text-[14px] font-bold text-slate-800">{guru.nama}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[14px] font-semibold text-slate-700">{guru.mataPelajaran}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-[12px] text-slate-500 font-bold">
                        <Mail className="w-3.5 h-3.5 text-blue-400" />
                        {guru.email}
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-slate-500 font-bold">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        {guru.nohp}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-[4px] shadow-sm ${guru.totalSiswa > 0 ? "bg-[#854D0E]/10 text-[#854D0E] border border-[#854D0E]/20" : "bg-[#854D0E] text-white"}`}>
                      {guru.totalSiswa} Siswa
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider leading-none shadow-sm border ${
                        guru.status === 'aktif' ? 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {guru.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => handleEdit(guru)}
                         className="w-9 h-9 rounded-xl flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-all active:scale-90 border border-transparent hover:border-blue-100" 
                         title="Edit"
                       >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(guru)}
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

        {/* Pagination */}
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

      {/* Modals */}
      <GuruModal 
        isOpen={isGuruModalOpen}
        onClose={() => setIsGuruModalOpen(false)}
        onSuccess={loadData}
        guru={currentGuru}
      />

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus"
        message={`Yakin ingin menghapus guru ${guruToDelete?.nama}? Aksi ini tidak dapat dibatalkan.`}
        loading={deleting}
      />
    </div>
  )
}
