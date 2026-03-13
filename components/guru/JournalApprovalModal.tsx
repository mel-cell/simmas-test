'use client'

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { GuruJournalApproval } from '@/types/guru'
import { 
  Loader2, 
  Check, 
  X, 
  Calendar, 
  User, 
  Building2, 
  FileText, 
  AlertCircle, 
  MessageSquare,
  Edit2,
  XCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

interface JournalApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  onAction: (status: 'disetujui' | 'ditolak', notes: string) => Promise<void>
  journal: GuruJournalApproval | null
}

export function JournalApprovalModal({ isOpen, onClose, onAction, journal }: JournalApprovalModalProps) {
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [isEditingNotes, setIsEditingNotes] = useState(false)

  useEffect(() => {
    if (journal && isOpen) {
      setNotes(journal.catatan_guru || '')
      setIsEditingNotes(!journal.catatan_guru && journal.status === 'menunggu')
    }
  }, [journal, isOpen])

  const handleAction = async (status: 'disetujui' | 'ditolak') => {
    try {
      setLoading(true)
      await onAction(status, notes || '')
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusLabel = (status: string) => {
    if (status === 'menunggu') return 'Belum Diverifikasi'
    if (status === 'disetujui') return 'Disetujui'
    if (status === 'ditolak') return 'Ditolak'
    return status
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl bg-white rounded-[24px] p-0 overflow-hidden border-none shadow-2xl font-sans">
        {/* Header with Icon */}
        <DialogHeader className="p-8 pb-5 flex flex-row items-center gap-4 relative">
          <div className="w-12 h-12 rounded-xl bg-[#00BCD4] flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
             <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col gap-0.5">
             <DialogTitle className="text-xl font-black text-slate-800 tracking-tight">
                Detail Jurnal Harian
             </DialogTitle>
             <span className="text-slate-400 font-bold text-sm">
                {journal?.tgl ? format(new Date(journal.tgl), 'EEEE, d MMMM yyyy', { locale: localeId }) : ''}
             </span>
          </div>
          <button 
            onClick={onClose}
            className="absolute right-8 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-300"
          >
             <X className="w-6 h-6" />
          </button>
        </DialogHeader>

        <div className="p-8 pt-2 flex flex-col gap-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
           {/* Informasi Siswa Section */}
           <div className="bg-[#F8FAFC] rounded-3xl p-8 flex flex-col md:flex-row gap-8 relative border border-slate-100">
              {/* Left Side: Profile */}
              <div className="flex flex-col gap-4 flex-1">
                 <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-[#00BCD4]" />
                    <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">Informasi Siswa</h3>
                 </div>
                 <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-[#00BCD4] flex items-center justify-center overflow-hidden shadow-inner">
                       <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[18px] font-black text-slate-800 tracking-tight leading-tight mb-1">{journal?.siswa?.full_name}</span>
                       <span className="text-[13px] font-bold text-slate-400">NIS: {journal?.siswa?.nomor_induk}</span>
                       <div className="flex items-center gap-3 mt-2">
                          <span className="text-[11px] font-black text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded-md">CLASS: {journal?.siswa?.kelas}</span>
                       </div>
                       <span className="text-[12px] font-bold text-slate-500 mt-2">Jurusan: <span className="text-slate-800">{journal?.siswa?.jurusan}</span></span>
                    </div>
                 </div>
              </div>

              {/* Right Side: Magang Info */}
              <div className="flex flex-col gap-4 flex-1 border-t md:border-t-0 md:border-l border-slate-200/50 md:pl-8 pt-6 md:pt-0">
                 <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-tight">Tempat Magang</h3>
                 </div>
                 <div className="flex flex-col gap-1.5">
                    <span className="text-[16px] font-black text-slate-800 leading-tight">{journal?.dudi?.nama_perusahaan}</span>
                    <span className="text-[12px] font-medium text-slate-400 leading-relaxed max-w-[200px]">{journal?.dudi?.alamat}</span>
                    <div className="mt-2 flex flex-col">
                       <span className="text-[11px] font-black text-[#00BCD4] uppercase">PIC: {journal?.dudi?.pic || 'Maya Sari'}</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Date & Status Row */}
           <div className="bg-[#F8FAFC] rounded-2xl p-4 flex items-center justify-between border border-slate-100">
              <div className="flex items-center gap-3">
                 <Calendar className="w-4 h-4 text-slate-400" />
                 <span className="text-[14px] font-bold text-slate-700">
                    {journal?.tgl ? format(new Date(journal.tgl), 'EEEE, d MMMM yyyy', { locale: localeId }) : ''}
                 </span>
              </div>
              <Badge className={`border-none px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-none ${
                 journal?.status === 'disetujui' ? 'bg-green-100 text-green-700' :
                 journal?.status === 'ditolak' ? 'bg-red-100 text-red-700' :
                 'bg-orange-100 text-orange-700'
              }`}>
                 {getStatusLabel(journal?.status || '')}
              </Badge>
           </div>

           {/* Activities Section */}
           <div className="flex flex-col gap-3 mt-2">
              <div className="flex items-center gap-3 px-1">
                 <FileText className="w-4 h-4 text-[#2563EB]" />
                 <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">Kegiatan Hari Ini</h3>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                 <p className="text-[14px] font-bold text-slate-600 leading-relaxed">
                    {journal?.kegiatan}
                 </p>
              </div>
           </div>

           {/* Obstacles Section */}
           {journal?.kendala && (
              <div className="flex flex-col gap-3 mt-2">
                 <div className="flex items-center gap-3 px-1">
                    <AlertCircle className="w-4 h-4 text-orange-400" />
                    <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">Kendala yang Dihadapi</h3>
                 </div>
                 <div className="bg-white border-[#FFEBC8] border-2 rounded-xl p-5 shadow-sm">
                    <p className="text-[14px] font-bold text-slate-600 leading-relaxed italic">
                       {journal.kendala}
                    </p>
                 </div>
              </div>
           )}

           {/* documentation if exists */}
           {journal?.foto_url && (
              <div className="flex flex-col gap-3 mt-2">
                 <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight px-1">Dokumentasi Foto</h3>
                 <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-100">
                       <Image 
                         src={journal.foto_url} 
                         alt="Dokumentasi" 
                         fill
                         className="object-cover"
                       />
                    </div>
                 </div>
              </div>
           )}

           {/* Catatan Guru Section */}
           <div className="flex flex-col gap-3 mt-2 mb-10">
              <div className="flex items-center justify-between px-1">
                 <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-violet-500" />
                    <h3 className="text-[14px] font-black text-slate-800 uppercase tracking-tight">Catatan Guru</h3>
                 </div>
                 {journal?.status === 'menunggu' && !isEditingNotes && (
                    <Button 
                      variant="ghost" 
                      onClick={() => setIsEditingNotes(true)}
                      className="text-[#2563EB] font-black text-xs hover:bg-blue-50 h-8 px-3 rounded-lg flex items-center gap-2 bg-[#F0F7FF]"
                    >
                       <Edit2 className="w-3 h-3" />
                       Edit
                    </Button>
                 )}
              </div>
              
              {isEditingNotes ? (
                 <Textarea 
                   placeholder="Tuliskan catatan atau alasan penolakan di sini..."
                   value={notes}
                   onChange={(e) => setNotes(e.target.value)}
                   className="min-h-[120px] bg-slate-50 border-slate-200 rounded-2xl p-4 font-bold text-slate-700 focus:bg-white transition-all shadow-none placeholder:text-slate-300"
                 />
              ) : (
                 <div className={`border-2 border-dashed border-slate-200 rounded-2xl p-8 flex items-center justify-center ${notes ? 'bg-slate-50' : ''}`}>
                    <p className={`text-[13px] font-bold ${notes ? 'text-slate-600' : 'text-slate-400'}`}>
                       {notes || 'Belum ada catatan dari guru'}
                    </p>
                 </div>
              )}
           </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-slate-50 flex items-center gap-4">
           {journal?.status === 'menunggu' ? (
              <>
                 <Button 
                   onClick={() => handleAction('disetujui')}
                   disabled={loading}
                   className="flex-1 h-14 rounded-2xl bg-[#00A86B] hover:bg-[#008F5B] text-white font-black text-[15px] flex items-center justify-center gap-3 shadow-xl shadow-green-500/10"
                 >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        <Check className="w-6 h-6" />
                        Setujui
                      </>
                    )}
                 </Button>
                 <Button 
                   onClick={() => handleAction('ditolak')}
                   disabled={loading}
                   className="flex-1 h-14 rounded-2xl bg-[#E91E63] hover:bg-[#D81B60] text-white font-black text-[15px] flex items-center justify-center gap-3 shadow-xl shadow-pink-500/10"
                 >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        <X className="w-6 h-6" />
                        Tolak
                      </>
                    )}
                 </Button>
              </>
           ) : (
              <div className={`w-full h-14 rounded-2xl flex items-center justify-center font-black text-[15px] gap-3 ${
                 journal?.status === 'disetujui' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                 {journal?.status === 'disetujui' ? <Check className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                 Jurnal ini telah {journal?.status}
              </div>
           )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
