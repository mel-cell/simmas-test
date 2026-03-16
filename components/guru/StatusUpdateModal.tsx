'use client'

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useState, useEffect } from 'react'
import { BimbinganSiswa } from '@/types/guru'
import { Loader2, Calendar } from 'lucide-react'

interface StatusUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: { status: string, tgl_mulai: string, tgl_selesai: string, catatan: string }) => Promise<void>
  magang: BimbinganSiswa | null
}

export function StatusUpdateModal({ isOpen, onClose, onConfirm, magang }: StatusUpdateModalProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (magang && isOpen) {
      setStatus(magang.status || 'menunggu')
      setStartDate(magang.tgl_mulai || '')
      setEndDate(magang.tgl_selesai || '')
      setNotes(magang.catatan || '')
    }
  }, [magang, isOpen])

  const handleSubmit = async () => {
    try {
      setLoading(true)
      await onConfirm({
        status,
        tgl_mulai: startDate || null,
        tgl_selesai: endDate || null,
        catatan: notes
      } as any)
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl bg-white rounded-[32px] p-8 border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">
            Update Status Magang
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium text-sm">
            Atur status dan periode magang untuk siswa <span className="text-[#2563EB]">{magang?.siswa?.full_name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-2">
            <Label className="text-[13px] font-black text-slate-400 uppercase tracking-widest ml-1">Keputusan / Status</Label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-12 w-full bg-slate-50 border border-slate-100 rounded-xl px-4 font-medium text-slate-700 outline-none focus:ring-4 focus:ring-[#2563EB]/5 focus:border-[#2563EB]/30 transition-all appearance-none"
            >
              <option value="aktif">Aktif (Sedang Berlangsung)</option>
              <option value="selesai">Selesai (Tuntas)</option>
              <option value="menunggu">Menunggu Approval</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-[13px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Mulai</Label>
              <div className="relative">
                 <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <Input 
                   type="date"
                   value={startDate}
                   onChange={(e) => setStartDate(e.target.value)}
                   className="h-12 pl-11 bg-slate-50 border-slate-100 rounded-xl font-medium text-slate-700"
                 />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-[13px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Selesai</Label>
              <div className="relative">
                 <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <Input 
                   type="date"
                   value={endDate}
                   onChange={(e) => setEndDate(e.target.value)}
                   className="h-12 pl-11 bg-slate-50 border-slate-100 rounded-xl font-medium text-slate-700"
                 />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[13px] font-black text-slate-400 uppercase tracking-widest ml-1">Catatan Tambahan</Label>
            <Textarea 
              placeholder="Opsional: Catatan untuk siswa..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px] bg-slate-50 border-slate-100 rounded-xl p-4 font-medium text-slate-700 shadow-none focus:ring-4 focus:ring-[#2563EB]/5"
            />
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="rounded-2xl h-12 px-8 font-black text-slate-500 hover:bg-slate-50 transition-all border-slate-100"
          >
            Batal
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-2xl h-12 px-10 bg-[#2563EB] hover:bg-[#00ACC1] text-white font-black shadow-lg shadow-blue-600/20 transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Simpan Perubahan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
