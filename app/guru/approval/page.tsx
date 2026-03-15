'use client'

import { 
  Clock,
  Eye,
  Check,
  X,
  BookOpen,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronsLeft,
  Search,
  MapPin,
  CalendarDays
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { GuruJournalApproval, BimbinganSiswa } from '@/types/guru'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { JournalApprovalModal } from '@/components/guru/JournalApprovalModal'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

export default function ApprovalGuru() {
  const [journals, setJournals] = useState<GuruJournalApproval[]>([])
  const [internships, setInternships] = useState<BimbinganSiswa[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'jurnal' | 'magang'>('jurnal')
  
  // Modal state
  const [selectedJournal, setSelectedJournal] = useState<GuruJournalApproval | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchApprovalData = async () => {
    try {
      setLoading(true)
      const res = await api.guru.getJournals()
      setJournals(res.journals)
      setInternships(res.internships || [])
    } catch (error) {
      console.error('Failed to fetch approval data:', error)
      toast.error('Gagal mengambil data approval')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApprovalData()
  }, [])

  const handleAction = async (id: string, status: 'disetujui' | 'ditolak', notes: string = '') => {
    try {
      const res = await api.guru.approveJournal(id, status, notes)
      if (res.success) {
        toast.success(`Jurnal harian berhasil ${status === 'disetujui' ? 'disetujui' : 'ditolak'}`)
        fetchApprovalData()
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal update status jurnal'
      toast.error(message)
    }
  }

  const handleMagangAction = async (id: string, status: 'aktif' | 'dibatalkan') => {
    try {
      const res = await api.guru.updateMagangStatus(id, { 
        status,
        tgl_mulai: status === 'aktif' ? new Date().toISOString().split('T')[0] : undefined,
        tgl_selesai: status === 'aktif' ? new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0] : undefined
      })
      if (res.success) {
        toast.success(`Permohonan magang berhasil ${status === 'aktif' ? 'disetujui' : 'ditolak'}`)
        fetchApprovalData()
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal update status magang'
      toast.error(message)
    }
  }

  const filteredJournals = journals.filter(j => {
    return j.kegiatan.toLowerCase().includes(searchQuery.toLowerCase()) || 
           j.siswa.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const filteredInternships = internships.filter(i => {
    return i.siswa.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           i.dudi.nama_perusahaan.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const stats = {
    total: journals.length + internships.length,
    pending: journals.filter(j => j.status === 'menunggu').length + internships.length,
    approved: journals.filter(j => j.status === 'disetujui').length,
    rejected: journals.filter(j => j.status === 'ditolak').length,
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-20 px-4 md:px-8 max-w-[1600px] mx-auto text-sans">
      {/* Header Section */}
      <div className="mt-6 flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Approval Center</h1>
        <p className="text-slate-500 font-bold text-sm">Review dan setujui permohonan magang serta jurnal harian siswa</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Approval', value: stats.total, sub: 'Jurnal & Permohonan', icon: BookOpen, color: 'blue' },
          { label: 'Menunggu', value: stats.pending, sub: 'Perlu verifikasi segera', icon: Clock, color: 'blue' },
          { label: 'Disetujui', value: stats.approved, sub: 'Jurnal sudah diverifikasi', icon: CheckCircle2, color: 'green' },
          { label: 'Ditolak', value: stats.rejected, sub: 'Jurnal perlu perbaikan', icon: XCircle, color: 'red' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col gap-4 transition-all hover:shadow-md hover:border-[#2563EB]/10">
             <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                <div className={`${
                  stat.color === 'blue' ? 'text-[#2563EB]' : 
                  stat.color === 'green' ? 'text-green-500' : 'text-red-400'
                }`}>
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

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit self-center md:self-start">
        <button 
          onClick={() => {
            setActiveTab('jurnal')
            setSearchQuery('')
          }}
          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'jurnal' ? 'bg-white text-[#2563EB] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Jurnal Harian ({journals.length})
        </button>
        <button 
          onClick={() => {
            setActiveTab('magang')
            setSearchQuery('')
          }}
          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'magang' ? 'bg-white text-[#2563EB] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Permohonan Magang ({internships.length})
        </button>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          {/* Controls Header */}
          <div className="p-8 border-b border-slate-50">
             <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="relative w-full md:w-96">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                   <input 
                     type="text"
                     placeholder={activeTab === 'jurnal' ? "Cari siswa atau kegiatan..." : "Cari siswa atau DUDI..."}
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-bold text-slate-600 outline-none focus:bg-white focus:ring-4 focus:ring-[#2563EB]/5 transition-all shadow-sm"
                   />
                </div>
             </div>
          </div>

          <div className="overflow-x-auto">
             {activeTab === 'jurnal' ? (
               <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-white/50">
                       <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Siswa & DUDI</th>
                       <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tanggal & Kegiatan</th>
                       <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                       <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      Array(3).fill(0).map((_, i) => (
                        <tr key={i}><td colSpan={4} className="px-8 py-4"><Skeleton className="h-16 w-full rounded-2xl" /></td></tr>
                      ))
                    ) : filteredJournals.length > 0 ? (
                      filteredJournals.map((journal) => (
                        <tr key={journal.id} className="group hover:bg-slate-50/50 transition-colors">
                           <td className="px-8 py-6">
                              <div className="flex flex-col gap-1">
                                 <span className="text-[15px] font-bold text-slate-800 tracking-tight">{journal.siswa.full_name}</span>
                                 <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    <MapPin className="w-3 h-3" />
                                    {journal.dudi.nama_perusahaan}
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex flex-col gap-1">
                                 <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB]">
                                    <CalendarDays className="w-3.5 h-3.5" />
                                    {(() => {
                                      try {
                                        const d = journal.tgl ? new Date(journal.tgl) : null;
                                        return (d && !isNaN(d.getTime())) 
                                          ? format(d, 'EEEE, d MMMM yyyy', { locale: localeId }) 
                                          : '?';
                                      } catch {
                                        return '?';
                                      }
                                    })()}
                                 </div>
                                 <p className="text-sm text-slate-600 line-clamp-1 font-medium">{journal.kegiatan}</p>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-center">
                              <Badge className={`border-none px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                                journal.status === 'disetujui' ? 'bg-green-100 text-green-700' :
                                journal.status === 'menunggu' ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                 {journal.status}
                              </Badge>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <button 
                                onClick={() => {
                                  setSelectedJournal(journal)
                                  setIsModalOpen(true)
                                }}
                                className="inline-flex items-center gap-2 h-10 px-4 bg-slate-50 text-slate-600 rounded-xl font-bold text-[13px] hover:bg-[#2563EB] hover:text-white transition-all border border-slate-100"
                              >
                                 <Eye className="w-4 h-4" />
                                 Detail
                              </button>
                           </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold">Tidak ada jurnal untuk direview</td></tr>
                    )}
                 </tbody>
               </table>
             ) : (
               <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-white/50">
                       <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Siswa</th>
                       <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">DUDI</th>
                       <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                       <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {loading ? (
                       Array(3).fill(0).map((_, i) => (
                        <tr key={i}><td colSpan={4} className="px-8 py-4"><Skeleton className="h-16 w-full rounded-2xl" /></td></tr>
                      ))
                    ) : filteredInternships.length > 0 ? (
                      filteredInternships.map((item) => (
                        <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                           <td className="px-8 py-6">
                              <div className="flex flex-col gap-1">
                                 <span className="text-[15px] font-bold text-slate-800 tracking-tight">{item.siswa.full_name}</span>
                                 <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.siswa.kelas} • {item.siswa.jurusan}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                 <div className="p-2 bg-slate-50 rounded-lg">
                                    <MapPin className="w-4 h-4 text-[#2563EB]" />
                                 </div>
                                 <span className="text-sm font-bold text-slate-700">{item.dudi.nama_perusahaan}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-center">
                              <Badge className="bg-orange-100 text-orange-700 border-none px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                                 MENUNGGU
                              </Badge>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button 
                                  size="sm"
                                  onClick={() => handleMagangAction(item.id, 'aktif')}
                                  className="h-10 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold px-4 flex items-center gap-2"
                                >
                                   <Check className="w-4 h-4" />
                                   Terima
                                </Button>
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMagangAction(item.id, 'dibatalkan')}
                                  className="h-10 bg-red-50 text-red-500 hover:bg-red-100 border-red-100 rounded-xl font-bold px-4 flex items-center gap-2"
                                >
                                   <X className="w-4 h-4" />
                                   Tolak
                                </Button>
                              </div>
                           </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold">Tidak ada permohonan magang baru</td></tr>
                    )}
                 </tbody>
               </table>
             )}
          </div>

          {/* Pagination Footer */}
          <div className="px-8 py-6 border-t border-slate-50 bg-slate-50/30 flex flex-col md:flex-row items-center justify-between gap-4">
             <span className="text-[13px] font-bold text-slate-400">
                Menampilkan <span className="text-slate-700">{activeTab === 'jurnal' ? filteredJournals.length : filteredInternships.length}</span> {activeTab === 'jurnal' ? 'jurnal bimbingan' : 'permohonan magang'}
             </span>
             <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-300 pointer-events-none">
                   <ChevronsLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1">
                   <Button className="h-9 w-9 rounded-xl bg-[#2563EB] text-white font-bold text-xs shadow-lg shadow-blue-600/20 shadow-sm transition-all active:scale-95">1</Button>
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:bg-white hover:shadow-sm">
                   <ChevronRight className="w-4 h-4" />
                </Button>
             </div>
          </div>
      </div>
      
      <JournalApprovalModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAction={async (status, notes) => {
           if (selectedJournal) {
              await handleAction(selectedJournal.id, status, notes)
           }
        }}
        journal={selectedJournal}
      />
    </div>
  )
}
