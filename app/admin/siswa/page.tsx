'use client'

import { 
  Users, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock,
  UserCheck,
  Edit2,
  Trash2,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { StudentStats, SiswaData } from '@/types/admin'
import { api } from '@/lib/api'
import { StatCard } from '@/components/admin/StatCard'
import { Skeleton } from '@/components/ui/skeleton'
import { SiswaModal } from '@/components/admin/siswa/SiswaModal'
import { DeleteConfirmModal } from '@/components/admin/siswa/DeleteConfirmModal'

export default function ManajemenSiswa() {
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [students, setStudents] = useState<SiswaData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('semua')
  const [kelasFilter, setKelasFilter] = useState('semua')
  const [jurusanFilter, setJurusanFilter] = useState('semua')

  // Modal State
  const [isSiswaModalOpen, setIsSiswaModalOpen] = useState(false)
  const [currentSiswa, setCurrentSiswa] = useState<SiswaData | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [siswaToDelete, setSiswaToDelete] = useState<SiswaData | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.admin.getStudents({
        query: searchQuery,
        status: statusFilter,
        kelas: kelasFilter,
        jurusan: jurusanFilter
      })
      setStats(data.stats)
      setStudents(data.students)
    } catch (error) {
      console.error("Failed to load student data:", error)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, statusFilter, kelasFilter, jurusanFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAdd = () => {
    setCurrentSiswa(null)
    setIsSiswaModalOpen(true)
  }

  const handleEdit = (siswa: SiswaData) => {
    setCurrentSiswa(siswa)
    setIsSiswaModalOpen(true)
  }

  const handleDeleteClick = (siswa: SiswaData) => {
    setSiswaToDelete(siswa)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!siswaToDelete) return
    try {
      setDeleting(true)
      const res = await api.admin.deleteStudent(siswaToDelete.id)
      if (res.success) {
        setIsDeleteModalOpen(false)
        loadData()
      }
    } catch (error) {
      console.error('Failed to delete student:', error)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-medium text-slate-800 tracking-tight">Manajemen Siswa</h2>
          <p className="text-[14px] text-slate-500 mt-1 font-medium">Kelola data siswa dan penugasan magang</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard 
          loading={loading && !stats}
          title="Total Siswa" 
          value={stats?.total || 0} 
          description="Seluruh siswa terdaftar" 
          icon={Users} 
          color="text-[#00A3B8]"
        />
        <StatCard 
          loading={loading && !stats}
          title="Aktif Magang" 
          value={stats?.sedangMagang || 0} 
          description="Siswa sedang aktif magang" 
          icon={Clock} 
          color="text-[#F59E0B]"
        />
        <StatCard 
          loading={loading && !stats}
          title="Selesai Magang" 
          value={stats?.selesaiMagang || 0} 
          description="Siswa sudah menyelesaikan PKL" 
          icon={CheckCircle2} 
          color="text-[#22C55E]"
        />
        <StatCard 
          loading={loading && !stats}
          title="Siswa Belum Magang" 
          value={stats?.belumAdaPembimbing || 0} 
          description="Siswa aktif (biasa) & belum magang" 
          icon={UserCheck} 
          color="text-[#EF4444]"
        />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-none overflow-hidden">
        <div className="p-6 lg:p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-400" />
            </div>
            <h3 className="text-[18px] font-medium text-slate-800">Data Siswa</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={handleAdd}
              className="h-11 px-6 bg-[#2563EB] text-white rounded-xl font-medium text-[14px] flex items-center gap-2 hover:bg-[#1d4ed8] transition-all border border-[#2563EB]/10 shadow-lg shadow-blue-600/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Tambah Siswa
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 lg:px-8 py-5 bg-slate-50/50 border-b border-slate-50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Cari siswa..."
              className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-4 bg-white border border-slate-200 rounded-xl text-[14px] font-medium text-slate-600 focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 min-w-[150px] appearance-none"
          >
            <option value="semua">Semua Status</option>
            <option value="aktif">Aktif (Siswa)</option>
            <option value="magang">Aktif Magang</option>
            <option value="selesai">Selesai Magang</option>
          </select>

          <select 
            value={kelasFilter}
            onChange={(e) => setKelasFilter(e.target.value)}
            className="h-11 px-4 bg-white border border-slate-200 rounded-xl text-[14px] font-medium text-slate-600 focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 min-w-[150px] appearance-none"
          >
            <option value="semua">Semua Kelas</option>
            <option value="X">Kelas X</option>
            <option value="XI">Kelas XI</option>
            <option value="XII">Kelas XII</option>
          </select>

          <select 
            value={jurusanFilter}
            onChange={(e) => setJurusanFilter(e.target.value)}
            className="h-11 px-4 bg-white border border-slate-200 rounded-xl text-[14px] font-medium text-slate-600 focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 min-w-[180px] appearance-none"
          >
            <option value="semua">Semua Jurusan</option>
            <option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak</option>
            <option value="Teknik Komputer Jaringan">Teknik Komputer Jaringan</option>
            <option value="Multimedia">Multimedia</option>
            <option value="Desain Komunikasi Visual">Desain Komunikasi Visual</option>
            <option value="Teknik Otomasi Industri">Teknik Otomasi Industri</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="px-6 py-4 text-[11px] font-medium text-slate-400 uppercase tracking-[2px]">NIS</th>
                <th className="px-6 py-4 text-[11px] font-medium text-slate-400 uppercase tracking-[2px]">Nama</th>
                <th className="px-6 py-4 text-[11px] font-medium text-slate-400 uppercase tracking-[2px]">Kelas / Jurusan</th>
                <th className="px-6 py-4 text-[11px] font-medium text-slate-400 uppercase tracking-[2px]">Kontak</th>
                <th className="px-6 py-4 text-[11px] font-medium text-slate-400 uppercase tracking-[2px] text-center">Status</th>
                <th className="px-6 py-4 text-[11px] font-medium text-slate-400 uppercase tracking-[2px]">Pembimbing</th>
                <th className="px-6 py-4 text-[11px] font-medium text-slate-400 uppercase tracking-[2px] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-5"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-40" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </td>
                    <td className="px-6 py-5"><div className="flex justify-center"><Skeleton className="h-6 w-20 rounded" /></div></td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-48" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </td>
                    <td className="px-6 py-5"><div className="flex justify-end gap-2"><Skeleton className="w-8 h-8 rounded-lg" /><Skeleton className="w-8 h-8 rounded-lg" /></div></td>
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-slate-400 font-medium bg-slate-50/20">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                        <Users className="w-8 h-8 text-slate-300" />
                      </div>
                      <span className="text-[14px] font-medium text-slate-400">Tidak ada data siswa ditemukan.</span>
                    </div>
                  </td>
                </tr>
              ) : students.map((siswa) => (
                <tr key={siswa.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-6 py-5">
                    <span className="text-[13px] font-medium text-slate-700 font-mono tracking-tight">{siswa.nis}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#2563EB]/10 flex items-center justify-center border border-[#2563EB]/20 group-hover:scale-110 transition-transform">
                        <UserCheck className="w-4 h-4 text-[#2563EB]" />
                      </div>
                      <span className="text-[14px] font-medium text-slate-800">{siswa.nama}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-slate-700">{siswa.kelas}</span>
                      <span className="text-[12px] text-slate-400 font-medium tracking-tight italic">{siswa.jurusan}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1.5 min-w-[200px]">
                      <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium">
                        <Mail className="w-3.5 h-3.5 text-blue-400" />
                        {siswa.email}
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        {siswa.nohp}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider leading-none shadow-sm border ${
                        siswa.status === 'magang' ? 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]' :
                        siswa.status === 'selesai' ? 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]' :
                        siswa.status === 'aktif' ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {siswa.status === 'magang' ? 'Aktif Magang' : 
                         siswa.status === 'aktif' ? 'Aktif Biasa' : 
                         siswa.status === 'selesai' ? 'Selesai Magang' : siswa.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-2 max-w-[220px]">
                      <div className="flex items-center">
                        {siswa.pembimbing && siswa.pembimbing !== '-' ? (
                          <span className="text-[12px] font-medium text-slate-700 line-clamp-1 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                            {siswa.pembimbing}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[10px] font-medium border border-rose-100 uppercase tracking-wider w-fit">
                            Belum Ada Guru
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        {siswa.dudi && siswa.dudi !== '-' ? (
                          <span className="text-[11px] text-slate-500 font-medium line-clamp-1 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0"></div>
                            {siswa.dudi}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-medium border border-slate-200 uppercase tracking-wider w-fit">
                            Belum Ada DUDI
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(siswa)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-all active:scale-90 border border-transparent hover:border-blue-100" 
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(siswa)}
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
            <span className="text-[13px] text-slate-500 font-medium">Tampilkan</span>
            <select className="h-9 px-3 bg-white border border-slate-200 rounded-xl text-[13px] font-medium focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 appearance-none">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span className="text-[13px] text-slate-500 font-medium">data</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-800 hover:border-slate-300 transition-all shadow-sm active:scale-95 disabled:opacity-30" disabled>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-black text-slate-800">Halaman 1</span>
              <span className="text-[14px] text-slate-400 font-medium">dari 1</span>
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-800 hover:border-slate-300 transition-all shadow-sm active:scale-95 disabled:opacity-30" disabled>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SiswaModal 
        isOpen={isSiswaModalOpen}
        onClose={() => setIsSiswaModalOpen(false)}
        onSuccess={loadData}
        siswa={currentSiswa}
      />

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus"
        message={`Yakin ingin menghapus siswa ${siswaToDelete?.nama}? Aksi ini tidak dapat dibatalkan.`}
        loading={deleting}
      />
    </div>
  )
}
