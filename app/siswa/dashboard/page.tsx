'use client'

import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Building2, 
  UserSquare2, 
  CalendarDays,
  Plus,
  BookOpen,
  Info
} from 'lucide-react'
import { authService } from '@/services/authService'
import { useEffect, useState } from 'react'

export default function SiswaDashboard() {
  const [profile, setProfile] = useState<{ full_name: string } | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      const data = await authService.getProfile()
      if (data) {
        setProfile({
          full_name: data.profile?.full_name || 'Siswa'
        })
      }
    }
    fetchProfile()
  }, [])
  
  // Mock Data aligned with screenshot
  const userName = profile?.full_name || 'Memuat...'
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  // Data for Journal Activities
  const recentJournals = [
    {
      id: 1,
      title: 'Implementasi form validation dan state management menggunakan React Hook Form',
      date: '17 Juli 2024',
      status: 'Menunggu',
      note: null
    },
    {
      id: 2,
      title: 'Membuat landing page untuk website company profile menggunakan React dan Tailwind CSS',
      date: '15 Juli 2024',
      status: 'Disetujui',
      note: 'Perhatikan mobile responsiveness'
    }
  ]

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-10">
      
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-[#00A3FF] to-[#0057FF] rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col gap-1">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Selamat Datang, {userName}! 👋</h2>
          <p className="text-cyan-100 font-medium text-sm md:text-base opacity-90">
            2021002 • XII • RPL
          </p>
        </div>
        <div className="relative z-10 hidden sm:flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl mt-4 sm:mt-0 font-medium text-sm border border-white/20">
          <CalendarDays className="w-4 h-4 opacity-90" />
          <span>{currentDate}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Jurnal */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-slate-600">Total Jurnal</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className="text-3xl font-bold text-slate-800">2</h3>
            <span className="text-xs font-medium text-slate-400 mt-1">Jurnal yang dibuat</span>
          </div>
        </div>

        {/* Disetujui */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-slate-600">Disetujui</span>
            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-500 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className="text-3xl font-bold text-slate-800">1</h3>
            <span className="text-xs font-medium text-slate-400 mt-1">Jurnal disetujui</span>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-slate-600">Pending</span>
            <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className="text-3xl font-bold text-slate-800">1</h3>
            <span className="text-xs font-medium text-slate-400 mt-1">Menunggu verifikasi</span>
          </div>
        </div>

        {/* Ditolak */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-slate-600">Ditolak</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className="text-3xl font-bold text-slate-800">0</h3>
            <span className="text-xs font-medium text-slate-400 mt-1">Jurnal ditolak</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Kiri: Informasi Magang & Aktivitas Jurnal (2 Kolom) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Informasi Magang */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100/60 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <GraduationCapIcon className="w-5 h-5 text-cyan-600" />
                Informasi Magang
              </h3>
            </div>
            
            <div className="p-6 flex flex-col gap-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-cyan-600">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tempat Magang</span>
                    <span className="font-bold text-slate-800">CV. Digital Kreativa</span>
                    <span className="text-xs text-slate-500 leading-snug font-medium">Jl. Pemuda No. 45, Surabaya</span>
                  </div>
                </div>

                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-green-600">
                    <UserSquare2 className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Guru Pembimbing</span>
                    <span className="font-bold text-slate-800">Suryanto, S.Pd</span>
                    <span className="text-xs text-slate-500 leading-snug font-medium">Pemrograman Web & Mobile</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <CalendarDays className="w-4 h-4 text-slate-400" />
                  1 Juli 2024 - 30 September 2024
                </div>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide">AKTIF</span>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                <span className="text-xs font-bold text-blue-600">Catatan:</span>
                <p className="text-sm font-medium text-blue-800 leading-relaxed">Penempatan di divisi web development</p>
              </div>
            </div>
          </div>

          {/* Aktivitas Jurnal Terbaru */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100/60 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-600" />
                Aktivitas Jurnal Terbaru
              </h3>
              <button className="text-sm font-semibold text-cyan-600 hover:text-cyan-700 hover:underline">
                Lihat Semua
              </button>
            </div>
            
            <div className="flex flex-col p-6 gap-4">
              {recentJournals.map((journal) => (
                <div key={journal.id} className="group border border-slate-100 hover:border-cyan-100 bg-white rounded-xl p-5 shadow-sm hover:shadow-md hover:shadow-cyan-500/5 transition-all flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col gap-1.5 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide bg-slate-100 px-2 py-0.5 rounded-md">
                          {journal.date}
                        </span>
                        {journal.status === 'Menunggu' ? (
                          <span className="text-[11px] font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-md border border-yellow-200/50">
                            {journal.status}
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-md border border-green-200/50">
                            {journal.status}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800 leading-snug mt-1">
                        {journal.title}
                      </h4>
                    </div>
                    <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 hover:border-cyan-200 transition-colors shrink-0 opacity-0 group-hover:opacity-100">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>

                  {journal.note && (
                    <div className="mt-2 bg-blue-50/70 border border-blue-100 rounded-lg p-3 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500"></div>
                      <div className="flex flex-col gap-1 pl-1">
                        <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider">Catatan Guru:</span>
                        <p className="text-sm font-medium text-slate-700 italic">&quot;{journal.note}&quot;</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kanan: Aksi Cepat (1 Kolom) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col sticky top-24">
          <div className="px-6 py-4 border-b border-slate-100/60 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Aksi Cepat
            </h3>
          </div>
          
          <div className="p-6 flex flex-col gap-3">
            <button className="w-full flex items-center justify-center gap-2 bg-[#00A3FF] hover:bg-[#008AE6] text-white font-semibold py-3 px-4 rounded-xl transition-all border border-transparent hover:shadow-lg hover:shadow-[#00A3FF]/20 active:scale-[0.98]">
              <Plus className="w-5 h-5" />
              Buat Jurnal Baru
            </button>
            <button className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-xl transition-all border border-slate-200 shadow-sm hover:border-slate-300">
              <BookOpen className="w-5 h-5 text-slate-400" />
              Lihat Semua Jurnal
            </button>
            <button className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-xl transition-all border border-slate-200 shadow-sm hover:border-slate-300">
              <Info className="w-5 h-5 text-slate-400" />
              Info Magang
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function GraduationCapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  )
}
