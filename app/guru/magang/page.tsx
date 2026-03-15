'use client'

import { 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Filter, 
  ChevronDown,
  Info,
  Award,
  Calendar,
  User
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { BimbinganSiswa } from '@/types/guru'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { StatusUpdateModal } from '@/components/guru/StatusUpdateModal'
import { NilaiModal } from '@/components/guru/NilaiModal'
import { format } from 'date-fns'

export default function ManajemenMagangGuru() {
  const [bimbingan, setBimbingan] = useState<BimbinganSiswa[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [yearFilter, setYearFilter] = useState('all')
  const [monthFilter, setMonthFilter] = useState('all')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  
  // Modal states
  const [selectedMagang, setSelectedMagang] = useState<BimbinganSiswa | null>(null)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isNilaiModalOpen, setIsNilaiModalOpen] = useState(false)

  const fetchBimbingan = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.guru.getBimbingan({ 
        query: searchQuery, 
        status: statusFilter === 'all' ? undefined : statusFilter 
      })
      setBimbingan(res.bimbingan)
    } catch (error) {
      console.error('Failed to fetch bimbingan:', error)
      toast.error('Gagal mengambil data bimbingan')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, statusFilter])

  useEffect(() => {
    fetchBimbingan()
  }, [fetchBimbingan])

  const handleUpdateStatus = async (data: { status: string, tgl_mulai: string, tgl_selesai: string, catatan: string }) => {
    if (!selectedMagang) return
    try {
      const res = await api.guru.updateMagangStatus(selectedMagang.id, data)
      if (res.success) {
        toast.success('Status magang berhasil diperbarui')
        fetchBimbingan()
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal update status'
      toast.error(message)
    }
  }

  const handleInputNilai = async (nilai: number) => {
    if (!selectedMagang) return
    try {
      const res = await api.guru.inputNilai(selectedMagang.id, nilai)
      if (res.success) {
        toast.success('Nilai berhasil disimpan')
        fetchBimbingan()
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal simpan nilai'
      toast.error(message)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchBimbingan()
  }

  // Client-side filtering for extended filters
  const filteredBimbingan = bimbingan.filter(item => {
    // Year filter
    if (yearFilter !== 'all' && item.tgl_mulai) {
      if (new Date(item.tgl_mulai).getFullYear().toString() !== yearFilter) return false
    }

    // Month filter
    if (monthFilter !== 'all' && item.tgl_mulai) {
      if ((new Date(item.tgl_mulai).getMonth() + 1).toString() !== monthFilter) return false
    }

    // Date range filter
    if (dateRange.from && item.tgl_mulai) {
      if (new Date(item.tgl_mulai) < new Date(dateRange.from)) return false
    }
    if (dateRange.to && item.tgl_selesai) {
      if (new Date(item.tgl_selesai) > new Date(dateRange.to)) return false
    }

    return true
  })

  const stats = {
    total: bimbingan.length,
    aktif: bimbingan.filter(b => b.status === 'aktif').length,
    pending: bimbingan.filter(b => b.status === 'menunggu').length,
    selesai: bimbingan.filter(b => b.status === 'selesai' && b.nilai).length
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-20 px-4 md:px-8 max-w-[1600px] mx-auto text-sans">
      {/* Header Section */}
      <div className="mt-6 flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Manajemen Siswa Magang</h1>
        <p className="text-slate-500 font-bold text-sm">Kelola magang, tinjau pendaftaran, dan beri nilai siswa bimbingan</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Siswa', value: stats.total, sub: 'Siswa bimbingan', icon: User, color: 'blue' },
          { label: 'Magang Aktif', value: stats.aktif, sub: 'Sedang berlangsung', icon: CheckCircle2, color: 'green' },
          { label: 'Pending', value: stats.pending, sub: 'Menunggu approval', icon: Clock, color: 'orange' },
          { label: 'Siswa Selesai', value: stats.selesai, sub: 'Sudah dinilai', icon: Award, color: 'blue' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col gap-4 transition-all hover:shadow-md hover:border-[#2563EB]/10">
             <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                <div className={`${stat.color === 'blue' ? 'text-[#2563EB]' : 'text-' + stat.color + '-500'}`}>
                   <stat.icon className="w-5 h-5" />
                </div>
             </div>
             <div>
                <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{stat.value}</h3>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5">{stat.sub}</p>
             </div>
          </div>
        ))}
      </div>

      {/* Main Content Section */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          {/* Controls Header */}
          <div className="p-8 border-b border-slate-50">
             <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                   <h3 className="text-xl font-bold text-slate-800 tracking-tight whitespace-nowrap">Daftar Magang Siswa Bimbingan</h3>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                   <form onSubmit={handleSearch} className="relative flex-1 md:w-80">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        type="text"
                        placeholder="Cari siswa atau DUDI..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 outline-none focus:bg-white focus:ring-4 focus:ring-[#2563EB]/5 transition-all shadow-sm"
                      />
                   </form>
                   <Button 
                     variant="outline" 
                     onClick={() => setShowFilters(!showFilters)}
                     className="h-12 px-6 rounded-2xl border-none bg-[#E11D48] text-white font-bold text-[13px] flex items-center gap-2 hover:bg-[#BE123C] transition-all shadow-sm active:scale-95 whitespace-nowrap"
                   >
                       <Filter className="w-4 h-4" />
                       {showFilters ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
                       <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                   </Button>
                </div>
             </div>

             {/* Expanded Filters */}
             {showFilters && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-50 animate-in fade-in slide-in-from-top-4 duration-300 shadow-sm mt-4">
                  <div className="flex flex-col gap-2">
                     <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status Magang</label>
                     <select 
                       value={statusFilter}
                       onChange={(e) => setStatusFilter(e.target.value)}
                       className="h-12 w-full bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-slate-700 outline-none focus:bg-white transition-all appearance-none cursor-pointer"
                     >
                        <option value="all">Semua Status</option>
                        <option value="aktif">Aktif</option>
                        <option value="selesai">Selesai</option>
                        <option value="menunggu">Menunggu</option>
                        <option value="dibatalkan">Dibatalkan</option>
                     </select>
                  </div>
                  <div className="flex flex-col gap-2">
                     <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tahun Magang</label>
                     <select 
                       value={yearFilter}
                       onChange={(e) => setYearFilter(e.target.value)}
                       className="h-12 w-full bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-slate-700 outline-none focus:bg-white transition-all appearance-none cursor-pointer"
                     >
                        <option value="all">Semua Tahun</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                     </select>
                  </div>
                  <div className="flex flex-col gap-2">
                     <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Bulan Magang</label>
                     <select 
                       value={monthFilter}
                       onChange={(e) => setMonthFilter(e.target.value)}
                       className="h-12 w-full bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-slate-700 outline-none focus:bg-white transition-all appearance-none cursor-pointer"
                     >
                        <option value="all">Semua Bulan</option>
                        {Array.from({ length: 12 }, (_, i) => (
                           <option key={i + 1} value={(i + 1).toString()}>
                              {new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(2024, i))}
                           </option>
                        ))}
                     </select>
                  </div>

                  <div className="md:col-span-3 flex flex-col gap-2">
                     <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Rentang Tanggal Magang</label>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                           <span className="text-[10px] font-bold text-slate-400 ml-1">Dari Tanggal</span>
                           <input 
                             type="date"
                             value={dateRange.from}
                             onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                             className="h-12 w-full bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-slate-700 outline-none focus:bg-white transition-all"
                           />
                        </div>
                        <div className="flex flex-col gap-1.5">
                           <span className="text-[10px] font-bold text-slate-400 ml-1">Sampai Tanggal</span>
                           <input 
                             type="date"
                             value={dateRange.to}
                             onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                             className="h-12 w-full bg-slate-50 border border-slate-100 rounded-xl px-4 font-bold text-slate-700 outline-none focus:bg-white transition-all"
                           />
                        </div>
                     </div>
                  </div>
                  
                  <div className="md:col-span-3 pt-4">
                     <span className="text-[13px] font-bold text-slate-400">
                        {filteredBimbingan.length} data ditemukan
                     </span>
                  </div>
               </div>
             )}
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-white">
                      <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[2px]">Siswa</th>
                      <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[2px]">DUDI</th>
                      <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[2px]">Periode</th>
                      <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[2px] text-center">Status / Nilai</th>
                      <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[2px] text-right">Aksi</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-white">
                   {loading ? (
                     Array(4).fill(0).map((_, i) => (
                       <tr key={i}>
                          <td colSpan={5} className="px-8 py-4 text-center">
                             <Skeleton className="h-16 w-full rounded-2xl" />
                          </td>
                       </tr>
                     ))
                   ) : bimbingan.length > 0 ? (
                     bimbingan.map((item) => (
                       <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-[#2563EB] text-sm group-hover:bg-white transition-colors">
                                   {item.siswa.full_name.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-[15px] font-bold text-slate-800 tracking-tight">{item.siswa.full_name}</span>
                                   <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.siswa.kelas} • {item.siswa.jurusan}</span>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100">
                                   <MapPin className="w-4 h-4 text-[#2563EB]" />
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-sm font-bold text-slate-700">{item.dudi.nama_perusahaan}</span>
                                   <span className="text-[11px] font-medium text-slate-400 line-clamp-1">{item.dudi.alamat}</span>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2 text-[13px] font-bold text-slate-500">
                                <Calendar className="w-4 h-4 text-[#2563EB]/40" />
                                {(() => {
                                  try {
                                    const start = item.tgl_mulai ? new Date(item.tgl_mulai) : null;
                                    const end = item.tgl_selesai ? new Date(item.tgl_selesai) : null;
                                    const startStr = (start && !isNaN(start.getTime())) ? format(start, 'd MMM') : '?';
                                    const endStr = (end && !isNaN(end.getTime())) ? format(end, 'd MMM yyyy') : '?';
                                    return `${startStr} - ${endStr}`;
                                  } catch (e) {
                                    return '? - ?';
                                  }
                                })()}
                             </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                             {item.status === 'selesai' ? (
                               item.nilai ? (
                                 <div className="flex flex-col items-center gap-1">
                                   <Badge className="bg-blue-600 text-white border-none px-4 py-1.5 rounded-full text-[14px] font-black shadow-lg shadow-blue-600/20">
                                     {item.nilai}
                                   </Badge>
                                   <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">FINAL GRADE</span>
                                 </div>
                               ) : (
                                 <Badge className="bg-blue-100 text-blue-700 border-none px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                                   Selesai
                                 </Badge>
                               )
                             ) : (
                               <Badge className={`border-none px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                                 item.status === 'aktif' ? 'bg-green-100 text-green-700' :
                                 item.status === 'menunggu' ? 'bg-orange-100 text-orange-700' :
                                 'bg-red-100 text-red-700'
                               }`}>
                                  {item.status}
                               </Badge>
                             )}
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex items-center justify-end gap-2">
                                 {item.status === "selesai" ? (
                                   <Button 
                                     onClick={() => {
                                       setSelectedMagang(item)
                                       setIsNilaiModalOpen(true)
                                     }}
                                     className="h-10 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-[12px] flex items-center gap-2 transition-all shadow-sm active:scale-95 shadow-blue-600/10"
                                   >
                                      <Award className="w-4 h-4" />
                                      {item.nilai ? "Ubah Nilai" : "Beri Nilai"}
                                   </Button>
                                 ) : (
                                   <Button 
                                     onClick={() => {
                                       setSelectedMagang(item)
                                       setIsStatusModalOpen(true)
                                     }}
                                     className="h-10 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-[12px] flex items-center gap-2 transition-all shadow-sm active:scale-95 shadow-blue-600/10"
                                   >
                                      <CheckCircle2 className="w-4 h-4" />
                                      Status
                                   </Button>
                                 )}
                                 {item.status === "selesai" && (
                                   <Button 
                                     variant="ghost"
                                     onClick={() => {
                                       setSelectedMagang(item)
                                       setIsStatusModalOpen(true)
                                     }}
                                     className="h-10 w-10 p-0 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                     title="Ubah Status/Periode"
                                   >
                                      <CheckCircle2 className="w-4 h-4" />
                                   </Button>
                                 )}
                             </div>
                          </td>
                       </tr>
                     ))
                   ) : (
                     <tr>
                        <td colSpan={5} className="py-24 text-center">
                           <div className="flex flex-col items-center justify-center opacity-30">
                              <Info className="w-12 h-12 mb-4" />
                              <p className="font-bold text-xl">Data tidak ditemukan</p>
                           </div>
                        </td>
                     </tr>
                   )}
                </tbody>
             </table>
          </div>

          <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex flex-col md:flex-row items-center justify-between gap-4">
             <span className="text-xs font-bold text-slate-400 underline decoration-slate-200 decoration-2 underline-offset-4">
                Menampilkan {bimbingan.length} siswa bimbingan
             </span>
             <div className="flex items-center gap-4">
                <Button disabled variant="ghost" className="h-10 rounded-xl font-bold text-slate-400">Previous</Button>
                <div className="flex items-center gap-2">
                   <Button className="h-10 w-10 rounded-xl bg-[#2563EB] text-white font-bold text-sm shadow-lg shadow-blue-600/20">1</Button>
                </div>
                <Button disabled variant="ghost" className="h-10 rounded-xl font-bold text-slate-400">Next</Button>
             </div>
          </div>
      </div>

      <StatusUpdateModal 
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={handleUpdateStatus}
        magang={selectedMagang}
      />

      <NilaiModal 
        isOpen={isNilaiModalOpen}
        onClose={() => setIsNilaiModalOpen(false)}
        onConfirm={handleInputNilai}
        magang={selectedMagang}
      />
    </div>
  )
}
