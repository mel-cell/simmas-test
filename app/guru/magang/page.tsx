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

  const stats = {
    total: bimbingan.length,
    aktif: bimbingan.filter(b => b.status === 'aktif').length,
    pending: bimbingan.filter(b => b.status === 'menunggu').length,
    selesai: bimbingan.filter(b => b.status === 'selesai' && b.nilai).length
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-20 px-4 md:px-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="mt-6 flex flex-col gap-1">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Manajemen Siswa Magang</h1>
        <p className="text-slate-500 font-bold text-sm">Kelola magang, tinjau pendaftaran, dan beri nilai siswa bimbingan</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Siswa', value: stats.total, sub: 'Siswa bimbingan', icon: User, color: 'blue' },
          { label: 'Magang Aktif', value: stats.aktif, sub: 'Sedang berlangsung', icon: CheckCircle2, color: 'green' },
          { label: 'Pending', value: stats.pending, sub: 'Menunggu approval', icon: Clock, color: 'orange' },
          { label: 'Siswa Selesai', value: stats.selesai, sub: 'Sudah dinilai', icon: Award, color: 'cyan' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col gap-4">
             <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                <div className={`text-${stat.color === 'cyan' ? '[#00BCD4]' : stat.color}-500`}>
                   <stat.icon className="w-5 h-5" />
                </div>
             </div>
             <div>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5">{stat.sub}</p>
             </div>
          </div>
        ))}
      </div>

      {/* Main Content Section */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          {/* Controls Header */}
          <div className="p-8 border-b border-slate-50">
             <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                   <h3 className="text-xl font-black text-slate-800 tracking-tight whitespace-nowrap">Daftar Magang Siswa Bimbingan</h3>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                   <form onSubmit={handleSearch} className="relative flex-1 md:w-80">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        type="text"
                        placeholder="Cari siswa atau DUDI..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 outline-none focus:bg-white focus:ring-4 focus:ring-[#00BCD4]/5 transition-all"
                      />
                   </form>
                   <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-100 text-slate-600 font-black text-[13px] flex items-center gap-2">
                       <Filter className="w-4 h-4" />
                       Filter
                       <ChevronDown className="w-4 h-4 text-slate-300" />
                   </Button>
                </div>
             </div>

             {/* Filter Tabs (Quick access) */}
             <div className="flex items-center gap-3 mt-8 overflow-x-auto pb-2 scrollbar-hide text-sans">
                {[
                   { label: 'Semua Status', value: 'all' },
                   { label: 'Aktif', value: 'aktif' },
                   { label: 'Selesai', value: 'selesai' },
                   { label: 'Menunggu', value: 'menunggu' },
                   { label: 'Dibatalkan', value: 'dibatalkan' }
                ].map((f) => (
                   <button 
                     key={f.value}
                     onClick={() => setStatusFilter(f.value)}
                     className={`px-6 py-2 rounded-full text-[13px] font-black whitespace-nowrap transition-all ${
                       statusFilter === f.value ? 'bg-[#00BCD4] text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                     }`}
                   >
                      {f.label}
                   </button>
                ))}
             </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="border-b border-slate-50">
                      <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Siswa</th>
                      <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">DUDI</th>
                      <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Periode</th>
                      <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                      <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Nilai</th>
                      <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {loading ? (
                     Array(4).fill(0).map((_, i) => (
                       <tr key={i}>
                          <td colSpan={6} className="px-8 py-4">
                             <Skeleton className="h-16 w-full rounded-2xl" />
                          </td>
                       </tr>
                     ))
                   ) : bimbingan.length > 0 ? (
                     bimbingan.map((item) => (
                       <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-[#00BCD4] text-sm">
                                   {item.siswa.full_name.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-[15px] font-black text-slate-800 tracking-tight">{item.siswa.full_name}</span>
                                   <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.siswa.kelas} • {item.siswa.jurusan}</span>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white transition-colors">
                                   <MapPin className="w-4 h-4 text-[#00BCD4]" />
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-sm font-black text-slate-700">{item.dudi.nama_perusahaan}</span>
                                   <span className="text-[11px] font-medium text-slate-400 line-clamp-1">{item.dudi.alamat}</span>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2 text-[13px] font-bold text-slate-500">
                                <Calendar className="w-4 h-4 text-slate-300" />
                                {item.tgl_mulai ? format(new Date(item.tgl_mulai), 'd MMM') : '?'} - {item.tgl_selesai ? format(new Date(item.tgl_selesai), 'd MMM yyyy') : '?'}
                             </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                             <Badge className={`border-none px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                               item.status === 'aktif' ? 'bg-green-100 text-green-700' :
                               item.status === 'selesai' ? 'bg-blue-100 text-blue-700' :
                               item.status === 'menunggu' ? 'bg-orange-100 text-orange-700' :
                               'bg-red-100 text-red-700'
                             }`}>
                                {item.status}
                             </Badge>
                          </td>
                          <td className="px-8 py-6 text-center">
                             {item.nilai ? (
                               <div className="flex flex-col items-center">
                                  <span className="text-lg font-black text-[#00BCD4]">{item.nilai}</span>
                                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">GRADE</span>
                               </div>
                             ) : (
                               <span className="text-slate-300 italic font-bold">Belum dinilai</span>
                             )}
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <Button 
                                  onClick={() => {
                                    setSelectedMagang(item)
                                    setIsStatusModalOpen(true)
                                  }}
                                  className="h-10 px-4 rounded-xl bg-[#00BCD4] hover:bg-[#00ACC1] text-white font-black text-[12px] flex items-center gap-2"
                                >
                                   <CheckCircle2 className="w-4 h-4" />
                                   Status
                                </Button>
                                <Button 
                                  onClick={() => {
                                    setSelectedMagang(item)
                                    setIsNilaiModalOpen(true)
                                  }}
                                  className="h-10 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-black text-[12px] flex items-center gap-2"
                                >
                                   <Award className="w-4 h-4" />
                                   Nilai
                                </Button>
                             </div>
                          </td>
                       </tr>
                     ))
                   ) : (
                     <tr>
                        <td colSpan={6} className="py-24 text-center">
                           <div className="flex flex-col items-center justify-center opacity-30">
                              <Info className="w-12 h-12 mb-4" />
                              <p className="font-black text-xl">Data tidak ditemukan</p>
                           </div>
                        </td>
                     </tr>
                   )}
                </tbody>
             </table>
          </div>

          <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
             <span className="text-xs font-bold text-slate-400 underline decoration-slate-200 decoration-2 underline-offset-4">
                Menampilkan {bimbingan.length} siswa bimbingan
             </span>
             <div className="flex items-center gap-4">
                <Button disabled variant="ghost" className="h-10 rounded-xl font-bold text-slate-400">Previous</Button>
                <div className="flex items-center gap-2">
                   <Button className="h-10 w-10 rounded-xl bg-[#00BCD4] text-white font-black text-sm">1</Button>
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
