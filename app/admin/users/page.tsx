'use client'

import { 
  Users, 
  Search, 
  Plus, 
  Clock,
  Mail,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  ShieldCheck
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { UserProfileData } from '@/types/admin'
import { api } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'

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
          <h2 className="text-[24px] sm:text-[28px] font-bold text-slate-800 tracking-tight">Manajemen User</h2>
          <p className="text-[13px] sm:text-[14px] text-slate-500 mt-1 font-medium italic sm:not-italic">Kelola akses dan otoritas seluruh pengguna sistem</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-none overflow-hidden">
        <div className="p-5 sm:p-6 lg:p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-400" />
            </div>
            <h3 className="text-[16px] sm:text-[18px] font-bold text-slate-800">Daftar Pengguna</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button className="h-10 sm:h-11 px-5 sm:px-6 bg-[#00BCD4] text-white rounded-xl font-bold text-[13px] sm:text-[14px] flex items-center gap-2 hover:bg-[#00acc1] transition-all border border-[#00BCD4]/10 shadow-none group">
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
              Tambah User Baru
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-5 sm:px-6 lg:px-8 py-5 bg-slate-50/50 border-b border-slate-50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Cari nama, email, atau role..."
              className="w-full h-10 sm:h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/20 focus:border-[#00BCD4] transition-all placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="relative min-w-[170px]">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full h-10 sm:h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/20 appearance-none cursor-pointer"
            >
              <option value="semua">Semua Role</option>
              <option value="admin">Administrator</option>
              <option value="guru">Tenaga Pendidik</option>
              <option value="siswa">Peserta Didik</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-white">
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Informasi User</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider">Email & Keamanan</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider text-center">Hak Akses</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider text-center">Waktu Pendaftaran</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-9 h-9 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-20 rounded" />
                      </div>
                    </td>
                    <td className="px-6 py-5"><div className="flex justify-center"><Skeleton className="h-6 w-20 rounded-full" /></div></td>
                    <td className="px-6 py-5"><div className="flex justify-center"><Skeleton className="h-4 w-24" /></div></td>
                    <td className="px-6 py-5"><div className="flex justify-end gap-2"><Skeleton className="w-8 h-8" /><Skeleton className="w-8 h-8" /></div></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-400 font-medium bg-slate-50/20">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-8 h-8 text-slate-200" />
                      <span>Tidak ada data user ditemukan.</span>
                    </div>
                  </td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold shadow-sm border border-white/50 ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' :
                        user.role === 'GURU' ? 'bg-blue-100 text-blue-600' :
                        'bg-cyan-100 text-cyan-600'
                      }`}>
                        {getInitials(user.fullName)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] sm:text-[14px] font-bold text-slate-800">{user.fullName}</span>
                        <span className="text-[11px] text-slate-400 font-medium tracking-tight">ID: #USR-{user.id.slice(-5).toUpperCase()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-[12px] sm:text-[13px] text-slate-600 font-medium">
                        <Mail className="w-3.5 h-3.5 text-slate-300" />
                        {user.email}
                      </div>
                      {user.isVerified ? (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md w-fit border border-emerald-100 shadow-none">
                          <ShieldCheck className="w-3 h-3" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Verified Account</span>
                        </div>
                      ) : (
                         <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-md w-fit border border-amber-100 shadow-none">
                          <Clock className="w-3 h-3" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Pending</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-none ${getRoleStyle(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-[12px] sm:text-[13px] font-medium text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                       <button className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors tooltip" title="Edit Akses">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors tooltip" title="Bekukan Akun">
                        <Trash2 className="w-3.5 h-3.5" />
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
          <div className="flex items-center gap-2 order-2 sm:order-1">
            <span className="text-[13px] text-slate-400 font-medium">Tampilkan</span>
            <select className="h-8 px-2 bg-white border border-slate-200 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/10 appearance-none min-w-[50px] text-center cursor-pointer">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span className="text-[13px] text-slate-400 font-medium">per halaman</span>
          </div>

          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-[#00BCD4] hover:border-[#00BCD4]/30 transition-all shadow-sm disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-3">
              <span className="text-[13px] font-bold text-[#00BCD4]">1</span>
              <span className="text-[13px] text-slate-300">/</span>
              <span className="text-[13px] font-medium text-slate-500">1</span>
            </div>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-[#00BCD4] hover:border-[#00BCD4]/30 transition-all shadow-sm disabled:opacity-50" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
