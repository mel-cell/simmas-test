'use client'

import { Bell, Menu, UserCircle, LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useSchoolSettings } from '@/components/providers/SchoolSettingsProvider'

export function AdminHeader() {
  const { toggleSidebar } = useSidebar()
  const router = useRouter()
  const { settings, loading } = useSchoolSettings()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="h-[90px] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 bg-white border-b border-slate-100 shadow-none max-w-full">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
          <Menu className="w-5 h-5 text-slate-600" />
        </Button>
        <div className="hidden sm:flex flex-col ml-2">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              <div className="h-4 w-32 bg-slate-100 animate-pulse rounded" />
            </div>
          ) : (
            <>
              <h1 className="text-[16px] font-bold text-slate-800 leading-none">{settings?.namaSekolah || 'SMK Negeri 1 Surabaya'}</h1>
              <p className="text-[12px] text-slate-500 mt-1.5 font-medium tracking-tight">Sistem Manajemen Magang Siswa</p>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-6 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger className="relative w-10 h-10 flex items-center justify-center cursor-pointer group border-none bg-transparent outline-none hover:bg-slate-50 rounded-xl transition-all">
            <Bell className="w-[20px] h-[20px] text-slate-500 group-hover:text-slate-800 transition-colors" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[300px] sm:w-[320px] rounded-2xl p-0 overflow-hidden shadow-lg border border-slate-100 mt-2 bg-white z-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 bg-white">
              <span className="font-bold text-[16px] text-[#1e293b]">Notifikasi</span>
              <span className="px-2.5 py-0.5 rounded-md bg-[#854D0E] text-white text-[11px] font-bold">0</span>
            </div>
            <div className="flex flex-col items-center justify-center py-14 px-6">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-[14px] text-slate-500 font-medium font-sans">Tidak ada notifikasi</p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="h-4 w-px bg-slate-200 hidden sm:block mx-1" />

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer group border-none bg-transparent outline-none p-1 hover:bg-slate-50 rounded-xl transition-all">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#00BCD4] rounded-xl flex items-center justify-center text-white shrink-0 shadow-none transition-all group-hover:scale-105">
              <UserCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-start hidden lg:block">
              <p className="text-[13px] sm:text-[14px] font-bold text-[#1e293b] leading-tight">Admin Sistem</p>
              <p className="text-[11px] sm:text-[12px] text-slate-500 font-medium">Admin</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px] sm:w-[220px] rounded-2xl p-0 overflow-hidden shadow-xl border border-slate-100 mt-2 bg-white z-100">
            <div className="px-6 py-5 bg-white border-b border-slate-50">
              <p className="text-[16px] font-bold text-[#1e293b] leading-tight">Admin Sistem</p>
              <p className="text-[14px] text-slate-500 font-medium mt-1">Admin</p>
            </div>
            <div className="p-1.5">
              <DropdownMenuItem 
                onClick={handleLogout}
                className="flex items-center gap-4 px-5 py-3 text-red-500 hover:bg-red-50 cursor-pointer rounded-xl group transition-all"
              >
                <LogOut className="w-5 h-5 text-red-500 transition-colors" />
                <span className="font-bold text-[15px]">Keluar</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
