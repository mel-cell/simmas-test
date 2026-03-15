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
import { useState, useEffect } from 'react'
import { BimbinganSiswa } from '@/types/guru'
import { Loader2 } from 'lucide-react'

interface NilaiModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (nilai: number) => Promise<void>
  magang: BimbinganSiswa | null
}

export function NilaiModal({ isOpen, onClose, onConfirm, magang }: NilaiModalProps) {
  const [loading, setLoading] = useState(false)
  const [nilai, setNilai] = useState<string>('')

  useEffect(() => {
    if (magang && isOpen) {
      setNilai(magang.nilai?.toString() || '')
    }
  }, [magang, isOpen])

  const handleSubmit = async () => {
    const numNilai = Number(nilai)
    if (isNaN(numNilai) || numNilai < 0 || numNilai > 100) {
      alert('Nilai harus antara 0 - 100')
      return
    }

    try {
      setLoading(true)
      await onConfirm(numNilai)
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white rounded-[32px] p-8 border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">
            Input Nilai Akhir
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-bold text-sm">
            Berikan nilai akhir untuk <span className="text-[#2563EB]">{magang?.siswa?.full_name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-6">
          <div className="flex flex-col gap-3">
             <Label className="text-sm font-black text-slate-800 uppercase tracking-widest">Nilai Akhir (0-100)</Label>
             <Input 
                type="number"
                min="0"
                max="100"
                placeholder="Masukkan nilai.."
                value={nilai}
                onChange={(e) => setNilai(e.target.value)}
                className="h-14 bg-slate-50 border-slate-100 rounded-2xl text-xl font-black text-[#2563EB] focus:bg-white transition-all text-center"
             />
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="rounded-2xl h-12 px-8 font-black text-slate-500"
          >
            Batal
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-2xl h-12 px-10 bg-[#2563EB] hover:bg-[#00ACC1] text-white font-black shadow-lg shadow-blue-600/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Simpan Nilai'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
