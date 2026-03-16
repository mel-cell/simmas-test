'use client'

import Image from 'next/image'
import { 
  Plus, 
  Search,
  Clock,
  ChevronDown,
  FileText,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  Edit2,
  Trash2
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { SiswaJournal, SiswaMagang } from '@/types/siswa'
import { Skeleton } from '@/components/ui/skeleton'
import { format, isToday } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { JournalModal } from '@/components/siswa/JournalModal'

export default function JurnalSiswa() {
  const [journals, setJournals] = useState<SiswaJournal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingJournal, setEditingJournal] = useState<SiswaJournal | null>(null)
  const [magang, setMagang] = useState<SiswaMagang | null>(null)
  const [isCheckingStatus, setIsCheckingStatus] = useState(true)

  const fetchJournals = async () => {
    try {
      setLoading(true)
      const res = await api.siswa.getAllJournals()
      setJournals(res.journals)
    } catch (error) {
      console.error('Failed to load journals:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initPage = async () => {
      try {
        setIsCheckingStatus(true)
        const [journalsRes, dashboardRes] = await Promise.all([
          api.siswa.getAllJournals(),
          api.siswa.getDashboard()
        ])
        setJournals(journalsRes.journals)
        setMagang(dashboardRes.magang || null)
      } catch (error) {
        console.error('Failed to initialize journal page:', error)
      } finally {
        setIsCheckingStatus(false)
        setLoading(false)
      }
    }
    initPage()
  }, [])

  const handleEdit = (journal: SiswaJournal) => {
    setEditingJournal(journal)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingJournal(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jurnal ini?')) return
    try {
      const res = await api.siswa.deleteJournal(id)
      if (res.success) {
        fetchJournals()
      }
    } catch (err: unknown) {
      const error = err as Error
      alert(error?.message || 'Gagal menghapus jurnal')
    }
  }

  const filteredJournals = journals.filter(j => {
    const matchesQuery = j.kegiatan.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || j.status === statusFilter
    return matchesQuery && matchesStatus
  })

  const stats = {
    total: journals.length,
    disetujui: journals.filter(j => j.status === 'disetujui').length,
    menunggu: journals.filter(j => j.status === 'menunggu').length,
    ditolak: journals.filter(j => j.status === 'ditolak').length
  }

  const hasJournalToday = journals.some(j => {
    try {
      const date = j.tgl ? new Date(j.tgl) : null;
      return date && !isNaN(date.getTime()) && isToday(date);
    } catch {
      return false;
    }
  })

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto w-full pb-10 px-4 md:px-8">
      {/* Header Section */}
      <div className="flex items-center justify-between mt-4">
        <h1 className="text-3xl font-medium text-[#1E293B] tracking-tight">Jurnal Harian Magang</h1>
        <Button 
          onClick={() => {
            if (magang?.status !== 'aktif') {
              alert('Anda belum bisa membuat jurnal karena status magang belum aktif.')
              return
            }
            setIsModalOpen(true)
          }}
          disabled={magang?.status !== 'aktif' || isCheckingStatus}
          className={`${magang?.status === 'aktif' ? 'bg-[#2563EB] hover:bg-[#00ACC1]' : 'bg-slate-300 cursor-not-allowed'} text-white font-medium py-2 px-6 rounded-xl transition-all flex items-center gap-2 shadow-sm active:scale-95 text-sm h-11`}
        >
          <Plus className="w-5 h-5" />
          Tambah Jurnal
        </Button>
      </div>

      {/* Alert Banner Section */}
      {(magang?.status !== 'aktif' || !hasJournalToday) && !loading && (
        <div className={`rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm ${magang?.status === 'aktif' ? 'bg-[#FFF9E7] border border-[#FFECB3]' : 'bg-red-50 border border-red-100'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${magang?.status === 'aktif' ? 'bg-[#FEEBC8]' : 'bg-red-100'}`}>
              <FileText className={`w-6 h-6 ${magang?.status === 'aktif' ? 'text-[#DD6B20]' : 'text-red-500'}`} />
            </div>
            <div>
              <h3 className={`text-[15px] font-medium ${magang?.status === 'aktif' ? 'text-[#744210]' : 'text-red-800'}`}>
                {magang?.status === 'aktif' ? 'Jangan Lupa Jurnal Hari Ini!' : 'Akses Jurnal Terbatas'}
              </h3>
              <p className={`${magang?.status === 'aktif' ? 'text-[#975A16]' : 'text-red-600'} font-medium text-sm mt-0.5`}>
                {magang?.status === 'aktif' 
                  ? 'Anda belum membuat jurnal untuk hari ini. Dokumentasikan kegiatan magang Anda sekarang.'
                  : 'Anda belum bisa membuat laporan harian karena penempatan magang Anda belum aktif atau masih dalam proses persetujuan.'}
              </p>
            </div>
          </div>
          {magang?.status === 'aktif' && (
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#E67E22] hover:bg-[#D35400] text-white font-medium py-2 px-6 rounded-lg transition-all text-sm h-10 active:scale-95"
            >
              Buat Sekarang
            </Button>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Jurnal', value: stats.total, sub: 'Jurnal yang telah dibuat', color: 'blue', icon: FileText },
          { label: 'Disetujui', value: stats.disetujui, sub: 'Jurnal disetujui guru', color: 'cyan', icon: CheckCircle2 },
          { label: 'Menunggu', value: stats.menunggu, sub: 'Belum diverifikasi', color: 'blue-dark', icon: Clock },
          { label: 'Ditolak', value: stats.ditolak, sub: 'Perlu diperbaiki', color: 'red', icon: XCircle },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{item.label}</span>
              <div className={`text-${item.color === 'cyan' ? '[#2563EB]' : item.color === 'blue-dark' ? '[#2B6CB0]' : item.color === 'red' ? '[#E53E3E]' : '[#3182CE]'}`}>
                <item.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-3xl font-medium text-slate-800 tracking-tight">{item.value}</h3>
              <p className="text-slate-400 font-medium text-xs mt-1">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* History Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        {/* Table Header Controls */}
        <div className="p-6 border-b border-slate-50">
          <div className="flex items-center gap-2 mb-6">
             <FileText className="w-5 h-5 text-[#3182CE]" />
             <h3 className="text-lg font-medium text-[#1E293B]">Riwayat Jurnal</h3>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  type="text"
                  placeholder="Cari kegiatan atau kendala..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:bg-white focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB]/20 transition-all outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="ghost" className="flex items-center gap-2 text-slate-500 font-medium border border-slate-100 rounded-xl px-4 py-2.5 h-auto">
                <Filter className="w-4 h-4" />
                Tampilkan Filter
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </Button>
            </div>

            <div className="flex items-center gap-3 text-slate-400 text-[13px] font-medium w-full lg:w-auto justify-end">
              <span>Tampilkan:</span>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium cursor-pointer">
                10 <ChevronDown className="w-4 h-4" />
              </div>
              <span>per halaman</span>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-6 py-4 text-[13px] font-medium text-slate-800 tracking-tight w-[150px]">Tanggal</th>
                <th className="px-6 py-4 text-[13px] font-medium text-slate-800 tracking-tight min-w-[300px]">Kegiatan & Kendala</th>
                <th className="px-6 py-4 text-[13px] font-medium text-slate-800 tracking-tight text-center w-[120px]">Status</th>
                <th className="px-6 py-4 text-[13px] font-medium text-slate-800 tracking-tight w-[200px]">Feedback Guru</th>
                <th className="px-6 py-4 text-[13px] font-medium text-slate-800 tracking-tight text-right w-[100px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(5).fill(0).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <Skeleton className="h-5 w-full rounded-lg" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredJournals.length > 0 ? (
                filteredJournals.map((journal) => (
                  <tr key={journal.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700">
                          {(() => {
                            try {
                              const date = journal.tgl ? new Date(journal.tgl) : null;
                              return (date && !isNaN(date.getTime())) 
                                ? format(date, 'EEEE', { locale: localeId }) 
                                : '?';
                            } catch {
                              return '?';
                            }
                          })()}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          {(() => {
                            try {
                              const date = journal.tgl ? new Date(journal.tgl) : null;
                              return (date && !isNaN(date.getTime())) 
                                ? format(date, 'd MMM yyyy', { locale: localeId }) 
                                : '?';
                            } catch {
                              return '?';
                            }
                          })()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-4">
                        {journal.foto_url && (
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-sm shrink-0 border border-slate-100 group/img">
                             <Image 
                               src={journal.foto_url} 
                               alt="Dokumentasi" 
                               fill 
                               className="object-cover group-hover/img:scale-110 transition-all cursor-zoom-in"
                             />
                          </div>
                        )}
                        <div className="flex flex-col gap-1">
                          <p className="text-[13px] font-medium text-slate-700 leading-relaxed max-w-md line-clamp-3">
                            {journal.kegiatan}
                          </p>
                          {journal.kendala && (
                            <span className="text-[11px] font-medium text-red-500 italic">
                               Kendala: {journal.kendala}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <Badge className={`${
                         journal.status === 'disetujui' ? 'bg-green-100 text-green-700' :
                         journal.status === 'ditolak' ? 'bg-red-100 text-red-700' :
                         'bg-orange-100 text-orange-700'
                       } border-none px-3 py-1 rounded-lg text-[10px] font-medium uppercase tracking-widest inline-flex`}>
                         {journal.status}
                       </Badge>
                    </td>
                    <td className="px-6 py-5">
                       {journal.catatan_guru ? (
                         <p className="text-[13px] font-medium text-slate-500 italic">
                           &quot;{journal.catatan_guru}&quot;
                         </p>
                       ) : (
                         <span className="text-[12px] font-medium text-slate-300 italic">Hanya bisa dilihat guru</span>
                       )}
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#2563EB]">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {journal.status !== 'disetujui' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-400 hover:text-blue-500"
                                onClick={() => handleEdit(journal)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-400 hover:text-red-500"
                                onClick={() => handleDelete(journal.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-24">
                    <div className="flex flex-col items-center justify-center text-center">
                       <FileText className="w-16 h-16 text-slate-200 mb-4" />
                       <h3 className="text-lg font-medium text-slate-800">Belum ada jurnal</h3>
                       <p className="text-slate-400 font-medium text-sm mt-1">
                         Mulai dokumentasikan kegiatan magang Anda
                       </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div className="p-6 border-t border-slate-50 flex items-center justify-between">
           <span className="text-xs font-medium text-slate-400">
             Showing {filteredJournals.length} journals
           </span>
           <div className="flex items-center gap-2">
              <Button disabled variant="ghost" size="icon" className="rounded-lg border border-slate-100 h-9 w-9">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button className="h-9 w-9 rounded-lg bg-[#2563EB] text-white font-medium text-xs p-0 border-none">1</Button>
              <Button disabled variant="ghost" size="icon" className="rounded-lg border border-slate-100 h-9 w-9">
                <ChevronRight className="w-4 h-4" />
              </Button>
           </div>
        </div>
      </div>

      <JournalModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        onSuccess={fetchJournals}
        journal={editingJournal}
        magangInfo={magang}
      />
    </div>
  )
}
