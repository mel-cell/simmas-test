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
import { useState, useEffect } from 'react'
import { StudentStats, SiswaData } from '@/types/admin'
import { api } from '@/lib/api'
import { StatCard } from '@/components/admin/StatCard'

export default function ManajemenSiswa() {
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [students, setStudents] = useState<SiswaData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('semua')
  const [kelasFilter, setKelasFilter] = useState('semua')

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const data = await api.admin.getStudents({
          query: searchQuery,
          status: statusFilter,
          kelas: kelasFilter
        })
        setStats(data.stats)
        setStudents(data.students)
      } catch (error) {
        console.error("Failed to load student data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [searchQuery, statusFilter, kelasFilter])

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-bold text-slate-800 tracking-tight">Manajemen Siswa</h2>
          <p className="text-[14px] text-slate-500 mt-1 font-medium">Kelola data siswa dan penugasan magang</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard 
          title="Total Siswa" 
          value={stats?.total || 0} 
          description="Seluruh siswa terdaftar" 
          icon={Users} 
          color="text-[#00A3B8]"
        />
        <StatCard 
          title="Sedang Magang" 
          value={stats?.sedangMagang || 0} 
          description="Siswa di lokasi DUDI" 
          icon={Clock} 
          color="text-[#00A3B8]"
        />
        <StatCard 
          title="Selesai Magang" 
          value={stats?.selesaiMagang || 0} 
          description="Sudah menyelesaikan PKL" 
          icon={CheckCircle2} 
          color="text-[#22C55E]"
        />
        <StatCard 
          title="Belum Ada Pembimbing" 
          value={stats?.belumAdaPembimbing || 0} 
          description="Perlu penempatan segera" 
          icon={UserCheck} 
          color="text-[#EF4444]"
        />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-none overflow-hidden">
        <div className="p-6 lg:p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-400" />
            </div>
            <h3 className="text-[18px] font-bold text-slate-800">Data Siswa</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button className="h-11 px-6 bg-[#00BCD4] text-white rounded-xl font-bold text-[14px] flex items-center gap-2 hover:bg-[#00acc1] transition-all border border-[#00BCD4]/10 shadow-none">
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
              className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/20 focus:border-[#00BCD4] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-4 bg-white border border-slate-200 rounded-xl text-[14px] font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/20 min-w-[150px]"
          >
            <option value="semua">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="magang">Sedang Magang</option>
            <option value="selesai">Selesai</option>
          </select>

          <select 
            value={kelasFilter}
            onChange={(e) => setKelasFilter(e.target.value)}
            className="h-11 px-4 bg-white border border-slate-200 rounded-xl text-[14px] font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/20 min-w-[150px]"
          >
            <option value="semua">Semua Kelas</option>
            <option value="X">Kelas X</option>
            <option value="XI">Kelas XI</option>
            <option value="XII">Kelas XII</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="px-6 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider">NIS</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider">Kelas/Jurusan</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider">Kontak</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider">Pembimbing</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">Memuat data siswa...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">Tidak ada data siswa ditemukan.</td>
                </tr>
              ) : students.map((siswa) => (
                <tr key={siswa.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <span className="text-[14px] font-bold text-slate-700">{siswa.nis}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#00BCD4]/10 flex items-center justify-center">
                        <UserCheck className="w-4 h-4 text-[#00BCD4]" />
                      </div>
                      <span className="text-[14px] font-bold text-slate-800">{siswa.nama}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-semibold text-slate-700">{siswa.kelas}</span>
                      <span className="text-[12px] text-slate-400 font-medium">{siswa.jurusan}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium">
                        <Mail className="w-3.5 h-3.5 text-slate-300" />
                        {siswa.email}
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium">
                        <Phone className="w-3.5 h-3.5 text-slate-300" />
                        {siswa.nohp}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider leading-none shadow-sm ${
                        siswa.status === 'magang' ? 'bg-[#E0F2FE] text-[#0369A1]' :
                        siswa.status === 'selesai' ? 'bg-[#FCE7F3] text-[#BE185D]' :
                        'bg-[#DCFCE7] text-[#15803D]'
                      }`}>
                        {siswa.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-slate-700">Guru: {siswa.pembimbing}</span>
                      <span className="text-[12px] text-slate-400 font-medium">DUDI: {siswa.dudi}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors">
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
        <div className="px-6 lg:px-8 py-5 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/20">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-slate-500 font-medium">Tampilkan</span>
            <select className="h-8 px-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/10">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span className="text-[13px] text-slate-500 font-medium">data per halaman</span>
          </div>

          <div className="flex items-center gap-3">
            <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-800 hover:border-slate-300 transition-all shadow-sm">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center">
              <span className="text-[13px] font-medium text-slate-800">Halaman 1</span>
              <span className="mx-2 text-[13px] text-slate-400 font-medium">dari 1</span>
            </div>
            <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-800 hover:border-slate-300 transition-all shadow-sm">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
