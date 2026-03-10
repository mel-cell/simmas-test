'use client'

import { 
  Users, 
  Search, 
  Plus, 
  CheckCircle2, 
  Mail,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { UserProfileData } from '@/types/admin'
import { api } from '@/lib/api'

export default function ManajemenUser() {
  const [users, setUsers] = useState<UserProfileData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('semua')

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const data = await api.admin.getUsers({
          query: searchQuery,
          role: roleFilter
        })
        setUsers(data.users)
      } catch (error) {
        console.error("Failed to load user data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [searchQuery, roleFilter])

  // Helper for initials
  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  }

  // Helper for role styles
  const getRoleStyle = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN': return 'bg-purple-50 text-purple-600 border-purple-100'
      case 'GURU': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'SISWA': return 'bg-cyan-50 text-cyan-600 border-cyan-100'
      default: return 'bg-slate-50 text-slate-600 border-slate-100'
    }
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-bold text-slate-800 tracking-tight">Manajemen User</h2>
          <p className="text-[14px] text-slate-500 mt-1 font-medium">Kelola akses dan otoritas pengguna sistem</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-none overflow-hidden">
        <div className="p-6 lg:p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-400" />
            </div>
            <h3 className="text-[18px] font-bold text-slate-800">Daftar User</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button className="h-11 px-6 bg-[#00BCD4] text-white rounded-xl font-bold text-[14px] flex items-center gap-2 hover:bg-[#00acc1] transition-all shadow-none border border-[#00BCD4]/10">
              <Plus className="w-4 h-4" />
              Tambah User
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 lg:px-8 py-5 bg-slate-50/50 border-b border-slate-50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Cari nama, email, atau role..."
              className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/20 focus:border-[#00BCD4] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-[14px] font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/20 min-w-[160px] appearance-none cursor-pointer"
              >
                <option value="semua">Semua Role</option>
                <option value="admin">Admin</option>
                <option value="guru">Guru</option>
                <option value="siswa">Siswa</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="px-6 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider">Email & Verifikasi</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider text-center">Role</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider text-center">Terdaftar</th>
                <th className="px-6 py-4 text-[13px] font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">Memuat data user...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">Tidak ada data user ditemukan.</td>
                </tr>
              ) : users.map((user, idx) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' :
                        user.role === 'GURU' ? 'bg-blue-100 text-blue-600' :
                        'bg-cyan-100 text-cyan-600'
                      }`}>
                        {getInitials(user.fullName)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-slate-800">{user.fullName}</span>
                        <span className="text-[11px] text-slate-400 font-medium">ID: {idx + 1}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-[13px] text-slate-600 font-medium">
                        <Mail className="w-3.5 h-3.5 text-slate-300" />
                        {user.email}
                      </div>
                      {user.isVerified && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-600 rounded-md w-fit border border-green-100">
                          <CheckCircle2 className="w-3 h-3" />
                          <span className="text-[10px] font-bold uppercase tracking-wide">Verified</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getRoleStyle(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-[13px] font-medium text-slate-600">
                      {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
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

        {/* Pagination placeholder */}
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
