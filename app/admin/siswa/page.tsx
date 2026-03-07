'use client'

import { 
  Users, 
  Search, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Filter,
  UserPlus,
  Trash2,
  Edit2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

const dummySiswa = [
  { nis: '2021001', nama: 'Ahmad Rizki Ramadhan', kelas: 'XII - RPL', email: 'ahmad@student.sch.id', status: 'magang', pembimbing: 'Guru #2 / DUDI #1' },
  { nis: '2021002', nama: 'Siti Nurhaliza', kelas: 'XII - RPL', email: 'siti@student.sch.id', status: 'magang', pembimbing: 'Guru #2 / DUDI #2' },
  { nis: '2021003', nama: 'Budi Santoso', kelas: 'XII - TKJ', email: 'budi@student.sch.id', status: 'magang', pembimbing: 'Guru #3 / DUDI #3' },
  { nis: '2021004', nama: 'Dewi Lestari', kelas: 'XI - RPL', email: 'dewi@student.sch.id', status: 'selesai', pembimbing: 'Guru #2 / DUDI #4' },
  { nis: '2021005', nama: 'Eko Prasetyo', kelas: 'XI - TKJ', email: 'eko@student.sch.id', status: 'aktif', pembimbing: 'Guru #3 / DUDI #5' },
]

export default function ManajemenSiswa() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manajemen Siswa</h2>
          <p className="text-slate-500 mt-1">Kelola data siswa dan penugasan magang</p>
        </div>
        <Button className="bg-[#0096C7] hover:bg-[#0077B6] text-white font-bold h-12 px-6 rounded-2xl shadow-xl shadow-cyan-100 transition-all active:scale-95 gap-2">
          <UserPlus className="w-5 h-5" /> Tambah Siswa
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SmallStat title="Total Siswa" value="150" sub="Total Terdaftar" color="text-blue-600" />
        <SmallStat title="Sedang Magang" value="120" sub="Aktif Magang" color="text-cyan-600" />
        <SmallStat title="Selesai Magang" value="25" sub="Lulus Program" color="text-emerald-600" />
        <SmallStat title="Non-Aktif" value="5" sub="Belum Penempatan" color="text-rose-600" />
      </div>

      <Card className="border-none shadow-2xl shadow-slate-100 rounded-3xl overflow-hidden bg-white/80 backdrop-blur-md">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3 bg-slate-100/50 p-2 rounded-2xl w-full md:max-w-md border border-slate-100">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <Input 
                placeholder="Cari siswa..." 
                className="border-none bg-transparent focus-visible:ring-0 text-[15px] font-medium placeholder:text-slate-400 placeholder:font-normal"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 gap-2">
                <Filter className="w-4 h-4" /> Filter
              </Button>
              <select className="h-12 px-4 rounded-2xl border border-slate-200 text-slate-600 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option>Semua Status</option>
                <option>Magang</option>
                <option>Selesai</option>
                <option>Aktif</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-5 font-black text-[11px] uppercase tracking-widest text-slate-400 pl-4">NIS</th>
                  <th className="pb-5 font-black text-[11px] uppercase tracking-widest text-slate-400">Nama Lengkap</th>
                  <th className="pb-5 font-black text-[11px] uppercase tracking-widest text-slate-400">Kelas/Jurusan</th>
                  <th className="pb-5 font-black text-[11px] uppercase tracking-widest text-slate-400 text-center">Status</th>
                  <th className="pb-5 font-black text-[11px] uppercase tracking-widest text-slate-400">Pembimbing</th>
                  <th className="pb-5 font-black text-[11px] uppercase tracking-widest text-slate-400 text-center pr-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {dummySiswa.map((item) => (
                  <tr key={item.nis} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="py-5 pl-4">
                      <span className="font-black text-slate-900 text-sm tracking-tight">{item.nis}</span>
                    </td>
                    <td className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs shadow-inner">
                          {item.nama.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-[15px]">{item.nama}</p>
                          <p className="text-[11px] text-slate-400 font-semibold">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5">
                      <span className="text-sm font-bold text-slate-600 px-3 py-1 bg-slate-100 rounded-lg">{item.kelas}</span>
                    </td>
                    <td className="py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                        item.status === 'magang' ? 'bg-blue-100 text-blue-600' : 
                        item.status === 'selesai' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-5">
                      <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-100 px-3 py-1.5 rounded-xl shadow-sm">
                        {item.pembimbing}
                      </span>
                    </td>
                    <td className="py-5 pr-4">
                      <div className="flex items-center justify-center gap-2 grayscale group-hover:grayscale-0 transition-all duration-300">
                        <Button size="icon" variant="ghost" className="w-9 h-9 rounded-xl text-blue-600 hover:bg-blue-100 hover:text-blue-700 shadow-sm border border-slate-100 bg-white">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-9 h-9 rounded-xl text-red-600 hover:bg-red-100 hover:text-red-700 shadow-sm border border-slate-100 bg-white">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 flex items-center justify-between px-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Menampilkan <span className="text-slate-900">1</span> sampai <span className="text-slate-900">5</span> dari <span className="text-slate-900">25</span> entri
            </p>
            <div className="flex items-center gap-1.5">
              <PaginationButton icon={ChevronsLeft} disabled />
              <PaginationButton icon={ChevronLeft} disabled />
              <PaginationLink active>1</PaginationLink>
              <PaginationLink>2</PaginationLink>
              <PaginationLink>3</PaginationLink>
              <PaginationButton icon={ChevronRight} />
              <PaginationButton icon={ChevronsRight} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SmallStat({ title, value, sub, color }: any) {
  return (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl shadow-slate-100 border border-slate-50 flex flex-col justify-between h-40 group hover:shadow-2xl hover:scale-[1.03] transition-all duration-500">
      <div className="flex flex-col gap-3">
        <h4 className={`text-4xl font-black ${color} tracking-tighter`}>{value}</h4>
        <p className="text-[12px] font-bold text-slate-900 uppercase tracking-wide">{title}</p>
      </div>
      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest border-t border-slate-50 pt-4 mt-auto">
        {sub}
      </p>
    </div>
  )
}

function PaginationButton({ icon: Icon, disabled }: any) {
  return (
    <Button 
      variant="outline" 
      size="icon" 
      disabled={disabled}
      className="w-9 h-9 rounded-xl border-slate-100 text-slate-400 disabled:opacity-30 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300"
    >
      <Icon className="w-4 h-4" />
    </Button>
  )
}

function PaginationLink({ children, active }: any) {
  return (
    <Button 
      variant={active ? "default" : "outline"} 
      className={`w-9 h-9 p-0 rounded-xl text-sm font-black transition-all duration-300 ${
        active 
          ? 'bg-blue-600 shadow-lg shadow-blue-200 text-white' 
          : 'border-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
      }`}
    >
      {children}
    </Button>
  )
}
