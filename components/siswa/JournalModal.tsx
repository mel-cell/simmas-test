'use client'

import { useState } from 'react'
import { 
  Calendar as CalendarIcon, 
  Upload, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info
} from 'lucide-react'
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
import { uploadService } from '@/services/uploadService'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { SiswaJournal } from '@/types/siswa'
import { useEffect } from 'react'

interface JournalModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  journal?: SiswaJournal | null
  magangInfo?: {
    dudi: {
      nama_perusahaan: string
    }
    status: string
  } | null
}

export function JournalModal({ isOpen, onClose, onSuccess, journal, magangInfo }: JournalModalProps) {
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [problems, setProblems] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const isEdit = !!journal

  useEffect(() => {
    if (isOpen) {
      if (journal) {
        setDate(journal.tgl)
        setDescription(journal.kegiatan)
        setProblems(journal.kendala || '')
        setError(null)
      } else {
        setDate(new Date().toISOString().split('T')[0])
        setDescription('')
        setProblems('')
        setFile(null)
        setError(null)
      }
    }
  }, [isOpen, journal])

  const isDescriptionValid = description.length >= 50
  const isFormValid = isDescriptionValid && date !== ''

  const handleSubmit = async () => {
    if (!isFormValid) return

    try {
      setLoading(true)
      setError(null)

      let fotoUrl = ''
      if (file) {
        const uploadedUrl = await uploadService.uploadFile(file, 'logbooks')
        if (uploadedUrl) {
          fotoUrl = uploadedUrl
        }
      }

      let res: { success: boolean }
      if (isEdit && journal) {
        res = await api.siswa.updateJournal(journal.id, {
          kegiatan: description,
          kendala: problems,
          foto_url: fotoUrl || journal.foto_url,
          status: 'menunggu'
        })
      } else {
        res = await api.siswa.createJournal({
          tgl: date,
          kegiatan: description,
          kendala: problems,
          foto_url: fotoUrl,
          status: 'menunggu'
        })
      }

      if (res.success) {
        toast.success(isEdit ? 'Jurnal harian berhasil diperbarui' : 'Jurnal harian berhasil disimpan')
        onSuccess()
        onClose()
        if (!isEdit) {
          // Reset form only if not editing
          setDescription('')
          setProblems('')
          setFile(null)
        }
      }
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || 'Gagal menyimpan jurnal. Silakan coba lagi.')
      toast.error(error.message || 'Gagal menyimpan jurnal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl w-[95%] bg-white rounded-[40px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-8 pb-5">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-2xl font-medium text-slate-800 tracking-tight">
              {isEdit ? 'Edit Jurnal Harian' : 'Tambah Jurnal Harian'}
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium text-sm">
              {isEdit ? 'Perbarui dokumentasi kegiatan magang Anda' : 'Dokumentasikan kegiatan magang harian Anda'}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="p-8 pt-0 flex flex-col gap-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Panduan Alert */}
          <div className="bg-[#EEF7FF] border border-[#D0E8FF] rounded-[24px] p-6 flex gap-4">
            <div className="p-2.5 bg-white rounded-xl shadow-sm self-start flex items-center justify-center shrink-0 border border-blue-50">
              <Info className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <h4 className="text-[12px] font-medium text-[#0056B3] uppercase tracking-[2px]">
                PANDUAN PENULISAN JURNAL
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                <ul className="text-[13px] font-medium text-[#0066CC] space-y-1 list-disc pl-4 opacity-90 leading-relaxed">
                  <li>Minimal 50 karakter untuk deskripsi kegiatan</li>
                  <li>Deskripsikan kegiatan dengan detail & spesifik</li>
                  <li>Sertakan kendala yang dihadapi (jika ada)</li>
                </ul>
                <ul className="text-[13px] font-medium text-[#0066CC] space-y-1 list-disc pl-4 opacity-90 leading-relaxed">
                  <li>Upload dokumentasi pendukung (Foto/Dokumen)</li>
                  <li>Pastikan tanggal sesuai dengan hari kerja</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Informasi Dasar */}
          <div className="flex flex-col gap-4">
             <h3 className="text-sm font-medium text-slate-800 uppercase tracking-widest">Informasi Dasar</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                   <Label className="text-[13px] font-medium text-slate-500 ml-1">
                      Tanggal <span className="text-red-500">*</span>
                   </Label>
                   <div className="relative">
                      <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                      <Input 
                        type="date" 
                        value={date}
                        disabled={isEdit}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
                        className="pl-11 h-12 bg-slate-50 border-slate-100 rounded-xl font-medium text-slate-700 focus:bg-white transition-all outline-none ring-0 focus-visible:ring-4 focus-visible:ring-[#2563EB]/5 focus-visible:border-[#2563EB]/30 disabled:opacity-50"
                      />
                   </div>
                </div>
                <div className="flex flex-col gap-2">
                   <Label className="text-[13px] font-medium text-slate-500 ml-1">Penempatan DUDI</Label>
                   <Input 
                     disabled
                     value={(() => {
                        const dudi = Array.isArray(magangInfo?.dudi) ? magangInfo?.dudi[0] : magangInfo?.dudi;
                        return dudi?.nama_perusahaan || '-';
                     })()}
                     className="h-12 bg-slate-50 border-slate-100 rounded-xl font-medium text-slate-600 italic cursor-not-allowed"
                   />
                </div>
                <div className="flex flex-col gap-2">
                   <Label className="text-[13px] font-medium text-slate-500 ml-1">Status Aktivitas</Label>
                   <div className="h-12 bg-blue-50/50 border border-blue-100 rounded-xl px-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <span className="text-[13px] font-medium text-blue-700 uppercase tracking-wider">
                         {magangInfo?.status === 'aktif' ? 'Sedang Magang' : (magangInfo?.status || 'Aktif Magang')}
                      </span>
                   </div>
                </div>
             </div>
          </div>

          {/* Kegiatan Harian */}
          <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-800 uppercase tracking-widest">Kegiatan Harian</h3>
                <span className={`text-[10px] font-medium px-2 py-1 rounded-lg ${isDescriptionValid ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-400'}`}>
                  {description.length}/50 minimum
                </span>
             </div>
             <div className="flex flex-col gap-2">
                <Label className="text-[13px] font-medium text-slate-500 ml-1">
                   Deskripsi Kegiatan <span className="text-red-500">*</span>
                </Label>
                <Textarea 
                  placeholder="Deskripsikan kegiatan yang Anda lakukan hari ini secara detail. Contoh: Membuat wireframe untuk halaman login menggunakan Figma, kemudian melakukan coding HTML dan CSS untuk implementasi desain tersebut..."
                  className={`min-h-[160px] p-4 bg-slate-50 rounded-2xl font-semimedium text-slate-700 leading-relaxed transition-all ring-0 outline-none focus:bg-white focus-visible:ring-4 focus-visible:ring-[#2563EB]/5 ${isDescriptionValid ? 'border-slate-100 focus-visible:border-[#2563EB]/30' : 'border-red-100 focus-visible:border-red-200'}`}
                  value={description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                />
             </div>
             
             <div className="flex flex-col gap-2">
                <Label className="text-[13px] font-medium text-slate-500 ml-1">
                   Kendala & Hambatan <span className="text-slate-300 font-medium">(Opsional)</span>
                </Label>
                <Input 
                   placeholder="Sebutkan jika ada kendala yang dihadapi..."
                   className="h-12 bg-slate-50 border-slate-100 rounded-xl font-semimedium text-slate-700 focus:bg-white transition-all"
                   value={problems}
                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProblems(e.target.value)}
                />
             </div>
          </div>

          {/* Dokumentasi Pendukung */}
          <div className="flex flex-col gap-4 mb-4">
             <h3 className="text-sm font-medium text-slate-800 uppercase tracking-widest">Dokumentasi Pendukung</h3>
             <div className="flex flex-col gap-2 text-center">
                <div 
                   className={`relative border-2 border-dashed rounded-3xl p-8 flex flex-col items-center gap-4 transition-all ${file ? 'bg-green-50/30 border-green-200' : 'bg-slate-50 border-slate-100 hover:border-[#2563EB]/30 hover:bg-[#2563EB]/5'}`}
                >
                   <input 
                     type="file" 
                     className="absolute inset-0 opacity-0 cursor-pointer" 
                     onChange={(e) => setFile(e.target.files?.[0] || null)}
                     accept="image/*,.pdf,.doc,.docx"
                   />
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${file ? 'bg-green-100 text-green-600' : 'bg-white text-slate-400'}`}>
                      {file ? <CheckCircle2 className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                   </div>
                   <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-slate-700">
                        {file ? file.name : 'Pilih file dokumentasi'}
                      </p>
                      <p className="text-xs font-medium text-slate-400">
                        PDF, DOC, DOCX, JPG, PNG (Max 5MB)
                      </p>
                   </div>
                   {!file && (
                     <Button type="button" className="rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-medium h-10 px-8 transition-all text-sm shadow-md shadow-blue-500/10">
                        Browse File
                     </Button>
                   )}
                </div>
                <p className="text-[11px] font-medium text-slate-400 italic">
                  Jenis file yang dapat diupload: Screenshot hasil kerja, dokumentasi code, foto kegiatan
                </p>
             </div>
          </div>

          {/* Validation Summary */}
          {(!isFormValid || error) && (
            <div className="bg-[#FFF1F1] border border-[#FFE4E4] rounded-2xl p-5 flex gap-4 transition-all animate-in fade-in slide-in-from-top-2">
               <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-500" />
               </div>
               <div className="flex flex-col gap-1">
                  <h4 className="text-[13px] font-medium text-[#B91C1C] uppercase tracking-wider">Lengkapi form terlebih dahulu:</h4>
                  <ul className="text-[12px] font-medium text-[#DC2626]/80 list-disc pl-4 space-y-0.5">
                     {!date && <li>Pilih tanggal yang valid</li>}
                     {description.length < 50 && <li>Deskripsi kegiatan minimal 50 karakter</li>}
                     {error && <li>{error}</li>}
                  </ul>
               </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-8 pt-4 border-t border-slate-50 bg-slate-50/50 flex items-center justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="rounded-2xl h-12 px-8 font-medium text-slate-500 hover:bg-white hover:text-slate-800 transition-all text-sm border-slate-200"
            disabled={loading}
          >
            Batal
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid || loading}
            className={`rounded-2xl h-12 px-10 font-medium text-white transition-all text-sm shadow-xl ${isFormValid ? 'bg-[#2563EB] hover:bg-[#00ACC1] shadow-[#2563EB]/20' : 'bg-slate-300 cursor-not-allowed'}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : isEdit ? 'Perbarui Jurnal' : 'Simpan Jurnal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
