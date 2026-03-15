'use client'

import { 
  MapPin, 
  Search, 
  Phone, 
  Clock,
  CheckCircle2,
  XCircle,
  Briefcase,
  ChevronRight,
  User,
  AlertCircle,
  Send
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { SiswaDashboardResponse, SiswaDudi, SiswaApplication } from '@/types/siswa'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { TeacherSelectModal } from '@/components/siswa/TeacherSelectModal'

export default function MagangSiswa() {
  const [activeTab, setActiveTab] = useState<'status' | 'cari'>('status')
  const [data, setData] = useState<SiswaDashboardResponse | null>(null)
  const [applications, setApplications] = useState<SiswaApplication[]>([])
  const [availableDudi, setAvailableDudi] = useState<SiswaDudi[]>([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modal State
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false)
  const [selectedDudi, setSelectedDudi] = useState<{ id: string, nama: string } | null>(null)

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [dash, apps, dudi] = await Promise.all([
        api.siswa.getDashboard(),
        api.siswa.getApplications(),
        api.siswa.getAvailableDudis()
      ])
      setData(dash)
      setApplications(apps.applications)
      setAvailableDudi(dudi.dudi)
    } catch (err: unknown) {
      const error = err as Error
      console.error('Failed to load magang data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  const handleApply = (dudiId: string, companyName: string) => {
    setSelectedDudi({ id: dudiId, nama: companyName })
    setIsTeacherModalOpen(true)
  }

  const handleConfirmApplication = async (teacherId: string) => {
    if (!selectedDudi) return

    try {
      setApplying(true)
      const res = await api.siswa.applyInternship(selectedDudi.id, teacherId)
      if (res.success) {
        toast.success('Pendaftaran berhasil!')
        setIsTeacherModalOpen(false)
        fetchAllData()
        setActiveTab('status')
      }
    } catch (err: unknown) {
      const error = err as Error
      toast.error(error.message || 'Gagal mendaftar')
    } finally {
      setApplying(false)
    }
  }

  const filteredDudi = availableDudi.filter(d => 
    d.nama_perusahaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.alamat.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pendingCount = applications.filter(a => a.status === 'menunggu').length

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-20 px-8">
        <Skeleton className="h-40 w-full rounded-none" />
        <Skeleton className="h-10 w-64 rounded-none" />
        <div className="flex flex-col gap-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-20 px-8 max-w-[1400px] mx-auto">
      {/* Blue Header Section */}
      <div className="bg-[#2563EB] w-full rounded-none p-12 text-white text-center">
         <h1 className="text-4xl font-bold tracking-tight mb-2">Magang Siswa</h1>
         <p className="text-white/80 font-medium text-sm">Cari tempat magang dan pantau status pendaftaran Anda</p>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full mt-4">
         <div className="flex items-center justify-center gap-12 border-none pb-0">
            <button 
              onClick={() => setActiveTab('status')}
              className={`flex items-center gap-2 pb-2 text-[13px] font-bold transition-all relative ${activeTab === 'status' ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-600'}`}
            >
               <Clock className="w-4 h-4" />
               Status Magang Saya
               {activeTab === 'status' && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#2563EB] rounded-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('cari')}
              className={`flex items-center gap-2 pb-2 text-[13px] font-bold transition-all relative ${activeTab === 'cari' ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-600'}`}
            >
               <Search className="w-4 h-4" />
               Cari Tempat Magang
               {activeTab === 'cari' && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#2563EB] rounded-full" />}
            </button>
         </div>

         {activeTab === 'status' ? (
           <div className="flex flex-col gap-8 animate-in fade-in duration-500">
              
              {/* Profile Card */}
              <div className="bg-white rounded-2xl border border-[#D0E8FF] p-8 flex items-center justify-between shadow-sm">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                       <User className="w-8 h-8 text-slate-300" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                       <h3 className="text-xl font-bold text-slate-800">
                         {data?.profile?.full_name} • {data?.profile?.nomor_induk}
                       </h3>
                       <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">
                         {data?.profile?.kelas} • {data?.profile?.jurusan}
                       </p>
                    </div>
                 </div>

                 <div className="text-right flex flex-col items-end">
                    <div className="text-4xl font-bold text-[#2563EB] tracking-tight">
                      {pendingCount}<span className="text-slate-200">/3</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pendaftaran Pending</p>
                 </div>
              </div>

              {/* History Section */}
              <div className="flex flex-col gap-4">
                 <h3 className="text-[13px] font-bold text-slate-800 tracking-tight">Riwayat Pendaftaran</h3>
                 
                 {applications.length > 0 ? (
                   <div className="grid grid-cols-1 gap-4">
                      {applications.map((app) => (
                        <div key={app.id} className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center justify-between hover:border-blue-100 transition-all">
                           <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                                app.status === 'aktif' ? 'bg-green-50 text-green-500 border-green-100' :
                                app.status === 'menunggu' ? 'bg-orange-50 text-orange-500 border-orange-100' :
                                'bg-red-50 text-red-500 border-red-100'
                              }`}>
                                 {app.status === 'aktif' ? <CheckCircle2 className="w-6 h-6" /> : 
                                  app.status === 'menunggu' ? <Clock className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                              </div>
                              <div className="flex flex-col">
                                 <h4 className="font-bold text-slate-800">{app.dudi?.nama_perusahaan}</h4>
                                 <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {app.dudi?.alamat}
                                 </p>
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-6">
                              <div className="flex flex-col items-end">
                                 <span className={`text-[10px] font-bold px-3 py-1 rounded-lg ${
                                   app.status === 'aktif' ? 'bg-green-100 text-green-700' :
                                   app.status === 'menunggu' ? 'bg-orange-100 text-orange-700' :
                                   'bg-red-100 text-red-700'
                                 }`}>
                                    {app.status}
                                 </span>
                              </div>
                              <ChevronRight className="w-5 h-5 text-slate-300" />
                           </div>
                        </div>
                      ))}
                   </div>
                 ) : (
                   <div className="bg-white rounded-2xl border border-[#E2E8F0] py-24 flex flex-col items-center justify-center text-center px-8 border-dashed">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                         <AlertCircle className="w-8 h-8 text-slate-200" />
                      </div>
                      <h4 className="text-xl font-bold text-slate-800">Belum Ada Riwayat</h4>
                      <p className="text-slate-400 font-medium text-sm mt-1">Anda belum mendaftar ke tempat magang manapun.</p>
                      <Button 
                        onClick={() => setActiveTab('cari')}
                        className="mt-8 bg-[#2563EB] hover:bg-blue-600 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-blue-500/10 flex items-center gap-2"
                      >
                         <Search className="w-4 h-4" />
                         Cari Tempat Magang
                      </Button>
                   </div>
                 )}
              </div>
           </div>
         ) : (
           <div className="flex flex-col gap-8 animate-in fade-in duration-500">
              {/* Info Box */}
              <div className="bg-[#F0F7FF] border border-[#E0F0FF] rounded-2xl p-8">
                 <h4 className="text-sm font-bold text-[#2563EB] mb-3">Informasi Pendaftaran</h4>
                 <ul className="text-[13px] font-medium text-[#4A7AFF] space-y-2">
                     <li className="flex gap-2 underline decoration-blue-200">• Maksimal 3 pendaftaran dengan status pending.</li>
                     <li className="flex gap-2 underline decoration-blue-200">• Pendaftaran langsung masuk ke sistem magang (menunggu konfirmasi).</li>
                     <li className="flex gap-2 underline decoration-blue-200">• Jika pendaftaran sudah <span className="font-bold">AKTIF MAGANG</span>, Anda tidak bisa mendaftar lagi ke DUDI lain.</li>
                     <li className="flex gap-2 underline decoration-blue-200">• Saat ini: <span className="font-bold underline decoration-blue-500">{pendingCount}/3 pending.</span></li>
                 </ul>
              </div>

              {/* Search Bar */}
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                   type="text"
                   placeholder="Cari perusahaan atau lokasi..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 outline-none focus:bg-white focus:border-[#2563EB]/20 transition-all"
                 />
              </div>

              {/* DUDI List */}
              <div className="grid grid-cols-1 gap-6">
                 {filteredDudi.map((dudi) => (
                   <div key={dudi.id} className="bg-white rounded-2xl border border-slate-100 p-8 flex flex-col gap-6 shadow-sm hover:border-blue-100 transition-all">
                      <div className="flex flex-col gap-1">
                         <h3 className="text-lg font-bold text-slate-800">{dudi.nama_perusahaan}</h3>
                         <div className="flex flex-col gap-1 mt-2">
                            <div className="flex items-start gap-2 text-slate-400 font-medium text-[13px]">
                               <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                               {dudi.alamat}
                            </div>
                            {dudi.no_telp && (
                              <div className="flex items-center gap-2 text-slate-400 font-medium text-[13px]">
                                 <Phone className="w-4 h-4 shrink-0" />
                                 {dudi.no_telp}
                              </div>
                            )}
                         </div>
                      </div>

                      {(() => {
                        const isInterning = data?.magang?.status === 'aktif' || 
                                          data?.profile?.status === 'magang' || 
                                          applications.some(a => a.status === 'aktif');
                        const isMaxPending = pendingCount >= 3;
                        const isDisabled = isInterning || isMaxPending || applying;

                        return (
                          <Button 
                            onClick={() => handleApply(dudi.id, dudi.nama_perusahaan)}
                            disabled={isDisabled}
                            className={`w-full h-11 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                              isDisabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#2563EB] hover:bg-blue-600 text-white'
                            }`}
                          >
                            <Send className="w-4 h-4" />
                            {isInterning ? 'Sudah Aktif Magang' : 'Daftar'}
                          </Button>
                        );
                      })()}
                   </div>
                 ))}
                 
                 {filteredDudi.length === 0 && (
                   <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                      <Briefcase className="w-12 h-12 text-slate-200 mb-4" />
                      <p className="text-slate-600 font-bold">Tidak ditemukan perusahaan yang cocok</p>
                   </div>
                 )}
              </div>
           </div>
         )}
      </div>

      <TeacherSelectModal 
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        onConfirm={handleConfirmApplication}
        companyName={selectedDudi?.nama || ''}
        loading={applying}
      />
    </div>
  )
}
