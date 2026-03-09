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
  Award
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { TeacherStats, GuruData } from '@/types/admin'
import { api } from '@/lib/api'
import { StatCard } from '@/components/admin/StatCard'

export default function ManajemenGuru() {
  const [stats, setStats] = useState<TeacherStats | null>(null)
  const [teachers, setTeachers] = useState<GuruData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('semua')

  useEffect(() => {
    async function loadData() {
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
    }
    loadData()
  }, [searchQuery, statusFilter])

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-bold text-slate-800 tracking-tight">Manajemen Guru</h2>
          <p className="text-[14px] text-slate-500 mt-1 font-medium">Kelola data guru pembimbing</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard 
          title="Total Guru" 
          value={stats?.total || 0} 
          description="Guru pembimbing terdaftar" 
          icon={Users} 
          color="text-[#00A3B8]"
        />
        <StatCard 
          title="Guru Aktif" 
          value={stats?.aktif || 0} 
          description="Status siap membimbing" 
          icon={UserCheck} 
          color="text-[#22C55E]"
        />
        <StatCard 
          title="Total Siswa Bimbingan" 
          value={stats?.totalBimbingan || 0} 
          description="Siswa yang sedang PKL" 
          icon={BookOpen} 
          color="text-[#00A3B8]"
        />
        <StatCard 
          title="Rata-rata Siswa" 
          value={stats?.rataRataSiswa || 0} 
          description="Siswa per guru" 
          icon={Award} 
          color="text-[#EA580C]"
        />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border-0 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-6 lg:p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-400" />
            </div>
            <h3 className="text-[18px] font-bold text-slate-800">Data Guru</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button className="h-11 px-6 bg-[#00BCD4] text-white rounded-xl font-bold text-[14px] flex items-center gap-2 hover:bg-[#00acc1] transition-all shadow-md shadow-[#00BCD4]/20">
              <Plus className="w-4 h-4" />
              Tambah Guru
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 lg:px-8 py-5 bg-slate-50/50 border-b border-slate-50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Cari guru..."
              className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/20 focus:border-[#00BCD4] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-4 bg-white border border-slate-200 rounded-xl text-[14px] font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/20 min-w-[200px]"
          >
            <option value="semua">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="non-aktif">Non-Aktif</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="px-6 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider">NIP</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider">Mata Pelajaran</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider">Kontak</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider text-center">Siswa</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">Memuat data guru...</td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">Tidak ada data guru ditemukan.</td>
                </tr>
              ) : teachers.map((guru) => (
                <tr key={guru.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <span className="text-[14px] font-bold text-slate-700">{guru.nip}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#00BCD4]/10 flex items-center justify-center">
                        <UserCheck className="w-4 h-4 text-[#00BCD4]" />
                      </div>
                      <span className="text-[14px] font-bold text-slate-800">{guru.nama}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[14px] font-semibold text-slate-700">{guru.mataPelajaran}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium">
                        <Mail className="w-3.5 h-3.5 text-slate-300" />
                        {guru.email}
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium">
                        <Phone className="w-3.5 h-3.5 text-slate-300" />
                        {guru.nohp}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="px-2.5 py-1 bg-[#854D0E] text-white rounded text-[11px] font-bold">
                      {guru.totalSiswa} siswa
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider leading-none shadow-sm ${
                        guru.status === 'aktif' ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {guru.status}
                      </span>
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

        {/* Pagination placeholder matching Siswa page */}
        <div className="px-6 lg:px-8 py-5 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/20">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-slate-500 font-medium">Tampilkan</span>
            <select className="h-8 px-2 bg-white border border-slate-200 rounded-lg text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/10">
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
              <span className="text-[13px] font-bold text-slate-800">Halaman 1</span>
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
