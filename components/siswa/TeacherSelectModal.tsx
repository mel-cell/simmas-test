'use client'

import { 
  X, 
  User, 
  Send,
  Check,
  AlertCircle,
  Loader2,
  Mail,
  GraduationCap,
  Hash
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'

interface Teacher {
  id: string
  full_name: string
  nomor_induk: string
  jurusan: string
  email: string
}

interface TeacherSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (teacherId: string) => void
  companyName: string
  loading: boolean
}

export function TeacherSelectModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  companyName,
  loading: externalLoading 
}: TeacherSelectModalProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadTeachers()
    }
  }, [isOpen])

  async function loadTeachers() {
    try {
      setFetching(true)
      setError(null)
      const res = await api.siswa.getAvailableTeachers()
      setTeachers(res.teachers)
    } catch {
      setError('Gagal mengambil data guru pembimbing')
    } finally {
      setFetching(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
              <User className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-medium text-slate-800 leading-tight">
              Pilih Guru Pembimbing
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Area */}
        <div className="px-8 pt-6 pb-2 shrink-0">
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            Pilih guru pembimbing yang akan mendampingi Anda selama magang di <span className="font-medium text-slate-800">{companyName}</span>
          </p>
        </div>

        {/* Teacher List */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 custom-scrollbar">
          {fetching ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <p className="text-sm font-medium text-slate-400">Memuat daftar guru...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center flex flex-col items-center gap-4">
              <AlertCircle className="w-12 h-12 text-red-100" />
              <p className="text-sm font-medium text-slate-400">{error}</p>
              <Button onClick={loadTeachers} variant="outline" className="rounded-xl">Coba Lagi</Button>
            </div>
          ) : teachers.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-4">
              <User className="w-12 h-12 text-slate-100" />
              <p className="text-sm font-medium text-slate-400">Tidak ada guru pembimbing tersedia</p>
            </div>
          ) : (
            teachers.map((teacher) => (
              <button
                key={teacher.id}
                onClick={() => setSelectedId(teacher.id)}
                className={`w-full text-left p-5 rounded-2xl border transition-all flex items-start gap-4 relative group ${
                  selectedId === teacher.id 
                    ? 'border-blue-500 bg-blue-50/30' 
                    : 'border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50/50'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                  selectedId === teacher.id ? 'bg-blue-500 text-white border-blue-600' : 'bg-slate-50 text-slate-400 border-slate-100'
                }`}>
                  <User className="w-6 h-6" />
                </div>
                
                <div className="flex flex-col gap-1 pr-8">
                  <h4 className={`font-medium transition-colors ${selectedId === teacher.id ? 'text-blue-700' : 'text-slate-800'}`}>
                    {teacher.full_name}
                  </h4>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-[12px] font-semimedium text-slate-400">
                      <Hash className="w-3.5 h-3.5" />
                      NIP: {teacher.nomor_induk || '-'}
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] font-semimedium text-slate-400">
                      <GraduationCap className="w-3.5 h-3.5" />
                      Mata Pelajaran: {teacher.jurusan || '-'}
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] font-semimedium text-slate-400">
                      <Mail className="w-3.5 h-3.5" />
                      {teacher.email}
                    </div>
                  </div>
                </div>

                {selectedId === teacher.id && (
                  <div className="absolute right-5 top-5 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center animate-in zoom-in duration-300">
                    <Check className="w-3.5 h-3.5 stroke-[4]" />
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex items-center gap-3 shrink-0">
          <Button 
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1 h-12 rounded-2xl font-medium text-slate-600 hover:bg-slate-200 border-none"
          >
            Batal
          </Button>
          <Button 
            disabled={!selectedId || externalLoading}
            onClick={() => selectedId && onConfirm(selectedId)}
            className="flex-1 h-12 rounded-2xl font-medium bg-blue-400 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 border-none"
          >
            {externalLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Konfirmasi Pendaftaran
          </Button>
        </div>
      </div>
    </div>
  )
}
