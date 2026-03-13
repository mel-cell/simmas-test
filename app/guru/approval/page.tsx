'use client'

import { 
  Filter, 
  ChevronDown,
  Clock,
  Eye,
  Check,
  X,
  AlertCircle,
  BookOpen,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search
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

export default function ApprovalJurnalGuru() {
  const [journals, setJournals] = useState<GuruJournalApproval[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter] = useState('all')
  
  // Modal state
  const [selectedJournal, setSelectedJournal] = useState<GuruJournalApproval | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchJournals = async () => {
    try {
      setLoading(true)
      const res = await api.guru.getJournals()
      setJournals(res.journals)
    } catch (error) {
      console.error('Failed to fetch journals:', error)
      toast.error('Gagal mengambil data jurnal')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJournals()
  }, [])

  const handleAction = async (id: string, status: 'disetujui' | 'ditolak', notes: string = '') => {
    try {
      const res = await api.guru.approveJournal(id, status, notes)
      if (res.success) {
        toast.success(`Jurnal harian berhasil ${status === 'disetujui' ? 'disetujui' : 'ditolak'}`)
        fetchJournals()
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal update status jurnal'
      toast.error(message)
    }
  }

  const filteredJournals = journals.filter(j => {
    const matchesQuery = 
      j.kegiatan.toLowerCase().includes(searchQuery.toLowerCase()) || 
      j.siswa.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.dudi.nama_perusahaan.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || j.status === statusFilter
    return matchesQuery && matchesStatus
  })

  const stats = {
    total: journals.length,
    pending: journals.filter(j => j.status === 'menunggu').length,
    approved: journals.filter(j => j.status === 'disetujui').length,
    rejected: journals.filter(j => j.status === 'ditolak').length,
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-20 px-4 md:px-8 max-w-[1600px] mx-auto font-sans">
      {/* Header Section */}
      <div className="mt-6 flex flex-col gap-1">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Approval Jurnal Harian</h1>
        <p className="text-slate-500 font-bold text-sm">Review dan setujui jurnal harian siswa bimbingan</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Logbook', value: stats.total, sub: 'Laporan harian terdaftar', icon: BookOpen, color: 'blue' },
          { label: 'Belum Diverifikasi', value: stats.pending, sub: 'Menunggu verifikasi', icon: Clock, color: 'cyan' },
          { label: 'Disetujui', value: stats.approved, sub: 'Sudah diverifikasi', icon: CheckCircle2, color: 'green' },
          { label: 'Ditolak', value: stats.rejected, sub: 'Perlu perbaikan', icon: XCircle, color: 'red' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col gap-4">
             <div className="flex items-center justify-between">
                <span className="text-[13px] font-black text-slate-800">{stat.label}</span>
                <div className={`${
                  stat.color === 'blue' ? 'text-blue-500' : 
                  stat.color === 'cyan' ? 'text-cyan-500' : 
                  stat.color === 'green' ? 'text-green-500' : 'text-red-400'
                }`}>
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

      {/* Main Table Section */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          {/* Controls Header */}
          <div className="p-8">
             <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-2">
                <div className="relative w-full md:w-80">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                   <input 
                     type="text"
                     placeholder="Cari siswa, kegiatan, atau kendala..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-[13px] font-medium text-slate-600 outline-none focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all placeholder:text-slate-300"
                   />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto text-[13px]">
                   <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-100 text-slate-600 font-bold text-[13px] flex items-center gap-2">
                       <Filter className="w-4 h-4 text-slate-400" />
                       Tampilkan Filter
                       <ChevronDown className="w-4 h-4 text-slate-300" />
                   </Button>
                   <div className="flex items-center gap-2 text-slate-500 font-bold">
                      <span>Tampilkan:</span>
                      <div className="relative">
                         <select className="appearance-none bg-slate-50 border border-slate-100 rounded-lg px-4 py-1.5 pr-8 focus:outline-none text-[13px] font-black text-slate-600">
                            <option>10</option>
                            <option>25</option>
                            <option>50</option>
                         </select>
                         <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                      </div>
                      <span>per halaman</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="border-y border-slate-50 bg-slate-50/30">
                      <th className="px-8 py-4 w-12">
                         <input type="checkbox" className="rounded border-slate-200" />
                      </th>
                      <th className="px-4 py-4 text-[13px] font-black text-slate-700 uppercase tracking-tight">Siswa & Tanggal</th>
                      <th className="px-4 py-4 text-[13px] font-black text-slate-700 uppercase tracking-tight">Kegiatan & Kendala</th>
                      <th className="px-4 py-4 text-[13px] font-black text-slate-700 uppercase tracking-tight text-center">Status</th>
                      <th className="px-4 py-4 text-[13px] font-black text-slate-700 uppercase tracking-tight">Catatan Guru</th>
                      <th className="px-8 py-4 text-[13px] font-black text-slate-700 uppercase tracking-tight text-right">Aksi</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {loading ? (
                     Array(3).fill(0).map((_, i) => (
                       <tr key={i}>
                          <td colSpan={6} className="px-8 py-8">
                             <Skeleton className="h-24 w-full rounded-2xl" />
                          </td>
                       </tr>
                     ))
                   ) : filteredJournals.length > 0 ? (
                     filteredJournals.map((journal) => (
                       <tr key={journal.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6 align-top pt-8">
                             <input type="checkbox" className="rounded border-slate-200" />
                          </td>
                          <td className="px-4 py-6 align-top">
                             <div className="flex flex-col gap-0.5 pt-2">
                                <span className="text-[14px] font-black text-slate-800">{journal.siswa.full_name}</span>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">NIS: {journal.siswa.nomor_induk}</span>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{journal.siswa.kelas}</span>
                                <span className="text-[11px] font-bold text-slate-400 mt-2">{format(new Date(journal.tgl), 'd MMM yyyy', { locale: localeId })}</span>
                             </div>
                          </td>
                          <td className="px-4 py-6 max-w-[400px] align-top">
                             <div className="flex flex-col gap-2 pt-2">
                                <div className="flex flex-col gap-1">
                                   <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">Kegiatan:</span>
                                   <p className="text-[13px] font-bold text-slate-500 leading-snug line-clamp-2">{journal.kegiatan}</p>
                                </div>
                                {journal.kendala && (
                                   <div className="flex flex-col gap-1 mt-1">
                                      <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">Kendala:</span>
                                      <p className="text-[13px] font-bold text-slate-400 leading-snug line-clamp-2 italic">{journal.kendala}</p>
                                   </div>
                                )}
                             </div>
                          </td>
                          <td className="px-4 py-8 text-center align-top">
                             <Badge variant="outline" className={`border-none px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight shadow-none ${
                               journal.status === 'disetujui' ? 'bg-green-100 text-green-600' :
                               journal.status === 'ditolak' ? 'bg-red-100 text-red-600' :
                               'bg-orange-100 text-orange-600'
                             }`}>
                                {journal.status === 'menunggu' ? 'Belum Diverifikasi' : journal.status}
                             </Badge>
                          </td>
                          <td className="px-4 py-6 align-top">
                             <div className="pt-2">
                                {journal.catatan_guru ? (
                                   <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 max-w-[200px]">
                                      <p className="text-[11px] font-bold text-slate-500 leading-normal">{journal.catatan_guru}</p>
                                   </div>
                                ) : (
                                   <span className="text-[12px] font-bold text-slate-300 italic">Belum ada catatan</span>
                                )}
                             </div>
                          </td>
                          <td className="px-8 py-6 text-right align-top pt-8">
                             <div className="flex items-center justify-end gap-3 text-slate-400">
                                <button 
                                  onClick={() => {
                                     setSelectedJournal(journal)
                                     setIsModalOpen(true)
                                  }}
                                  className="hover:text-[#00BCD4] transition-colors" title="Lihat Detail"
                                >
                                   <Eye className="w-5 h-5" />
                                </button>
                                {journal.status === 'menunggu' && (
                                   <>
                                      <button 
                                        onClick={() => handleAction(journal.id, 'disetujui')}
                                        className="hover:text-green-500 transition-colors" title="Setujui"
                                      >
                                         <Check className="w-5 h-5" />
                                      </button>
                                      <button 
                                        onClick={() => handleAction(journal.id, 'ditolak')}
                                        className="hover:text-red-500 transition-colors" title="Tolak"
                                      >
                                         <X className="w-5 h-5" />
                                      </button>
                                   </>
                                )}
                             </div>
                          </td>
                       </tr>
                     ))
                   ) : (
                     <tr>
                        <td colSpan={6} className="py-24 text-center">
                           <div className="flex flex-col items-center justify-center opacity-30">
                              <AlertCircle className="w-12 h-12 mb-4" />
                              <p className="font-black text-xl">Data tidak ditemukan</p>
                           </div>
                        </td>
                     </tr>
                   )}
                </tbody>
             </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-8 py-6 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
             <span className="text-[13px] font-bold text-slate-500">
                Menampilkan 1 sampai {filteredJournals.length} dari {filteredJournals.length} entri
             </span>
             <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-300 pointer-events-none">
                   <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-300 pointer-events-none">
                   <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1">
                   <Button className="h-8 w-8 rounded-lg bg-[#00BCD4] text-white font-black text-xs p-0 flex items-center justify-center">1</Button>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400">
                   <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400">
                   <ChevronsRight className="w-4 h-4" />
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
