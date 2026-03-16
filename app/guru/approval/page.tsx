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
import { GuruJournalApproval } from '@/types/guru'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { JournalApprovalModal } from '@/components/guru/JournalApprovalModal'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

export default function ApprovalGuru() {
  const [journals, setJournals] = useState<GuruJournalApproval[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modal state
  const [selectedJournal, setSelectedJournal] = useState<GuruJournalApproval | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchApprovalData = async () => {
    try {
      setLoading(true)
      const res = await api.guru.getJournals()
      setJournals(res.journals || [])
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

  const filteredJournals = journals.filter(j => {
    return j.kegiatan.toLowerCase().includes(searchQuery.toLowerCase()) || 
           j.siswa.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const stats = {
    total: journals.length,
    pending: journals.filter(j => j.status === 'menunggu').length,
    approved: journals.filter(j => j.status === 'disetujui').length,
    rejected: journals.filter(j => j.status === 'ditolak').length,
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-20 px-4 md:px-8 max-w-[1600px] mx-auto text-sans">
      {/* Header Section */}
      <div className="mt-6 flex flex-col gap-1">
        <h1 className="text-3xl font-medium text-slate-800 tracking-tight">Approval Center</h1>
        <p className="text-slate-500 font-medium text-sm">Review dan verifikasi jurnal harian bimbingan siswa Anda</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Jurnal', value: stats.total, sub: 'Semua jurnal masuk', icon: BookOpen, color: 'blue' },
          { label: 'Menunggu', value: stats.pending, sub: 'Perlu verifikasi segera', icon: Clock, color: 'blue' },
          { label: 'Disetujui', value: stats.approved, sub: 'Jurnal sudah valid', icon: CheckCircle2, color: 'green' },
          { label: 'Ditolak', value: stats.rejected, sub: 'Perlu revisi siswa', icon: XCircle, color: 'red' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col gap-4 transition-all hover:shadow-md hover:border-[#2563EB]/10">
             <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">{stat.label}</span>
                <div className={`${
                  stat.color === 'blue' ? 'text-[#2563EB]' : 
                  stat.color === 'green' ? 'text-green-500' : 'text-red-400'
                }`}>
                   <stat.icon className="w-5 h-5" />
                </div>
             </div>
             <div>
                <h3 className="text-3xl font-medium text-slate-800 tracking-tight">{stat.value}</h3>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">{stat.sub}</p>
             </div>
          </div>
        ))}
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
                     placeholder="Cari siswa atau kegiatan..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[14px] font-medium text-slate-600 outline-none focus:bg-white focus:ring-4 focus:ring-[#2563EB]/5 transition-all shadow-sm"
                   />
                </div>
             </div>
          </div>

          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-white/50">
                     <th className="px-8 py-4 text-[11px] font-medium text-slate-400 uppercase tracking-widest">Siswa & DUDI</th>
                     <th className="px-8 py-4 text-[11px] font-medium text-slate-400 uppercase tracking-widest">Tanggal & Kegiatan</th>
                     <th className="px-8 py-4 text-[11px] font-medium text-slate-400 uppercase tracking-widest text-center">Status</th>
                     <th className="px-8 py-4 text-[11px] font-medium text-slate-400 uppercase tracking-widest text-right">Aksi</th>
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
                               <span className="text-[15px] font-medium text-slate-800 tracking-tight">{journal.siswa.full_name}</span>
                               <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                                  <MapPin className="w-3 h-3" />
                                  {journal.dudi.nama_perusahaan}
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex flex-col gap-1">
                               <div className="flex items-center gap-2 text-xs font-medium text-[#2563EB]">
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
                            <Badge className={`border-none px-3 py-1 rounded-lg text-[10px] font-medium uppercase tracking-widest ${
                              journal.status === 'disetujui' ? 'bg-green-100 text-green-700' :
                              journal.status === 'menunggu' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                               {journal.status}
                            </Badge>
                         </td>
                         <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-3">
                               <button 
                                 onClick={() => {
                                   setSelectedJournal(journal)
                                   setIsModalOpen(true)
                                 }}
                                 className="p-2.5 bg-white text-slate-400 rounded-xl border border-slate-200 shadow-sm hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB] transition-all group/btn"
                                 title="Lihat Detail"
                               >
                                  <Eye className="w-4 h-4" />
                               </button>
                               
                               {journal.status === 'menunggu' && (
                                 <>
                                    <button 
                                      onClick={() => {
                                        if (window.confirm('Setujui jurnal ini?')) {
                                           handleAction(journal.id, 'disetujui')
                                        }
                                      }}
                                      className="p-2.5 bg-white text-emerald-500 rounded-xl border border-emerald-200 shadow-sm hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all"
                                      title="Setujui Langsung"
                                    >
                                       <Check className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setSelectedJournal(journal)
                                        setIsModalOpen(true)
                                      }}
                                      className="p-2.5 bg-white text-rose-500 rounded-xl border border-rose-200 shadow-sm hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all"
                                      title="Tolak dengan Catatan"
                                    >
                                       <X className="w-4 h-4" />
                                    </button>
                                 </>
                               )}
                            </div>
                         </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium">Tidak ada jurnal untuk direview</td></tr>
                  )}
               </tbody>
             </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-8 py-6 border-t border-slate-50 bg-slate-50/30 flex flex-col md:flex-row items-center justify-between gap-4">
             <span className="text-[13px] font-medium text-slate-400">
                Menampilkan <span className="text-slate-700">{filteredJournals.length}</span> jurnal bimbingan
             </span>
             <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-300 pointer-events-none">
                   <ChevronsLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1">
                   <Button className="h-9 w-9 rounded-xl bg-[#2563EB] text-white font-medium text-xs shadow-lg shadow-blue-600/20 shadow-sm transition-all active:scale-95">1</Button>
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
