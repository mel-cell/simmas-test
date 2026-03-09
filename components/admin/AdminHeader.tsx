'use client'

import { Bell, Menu, UserCircle, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export function AdminHeader() {
  const { toggleSidebar } = useSidebar()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="h-[90px] px-8 flex items-center justify-between sticky top-0 z-30 bg-white">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
          <Menu className="w-5 h-5 text-slate-600" />
        </Button>
        <div className="hidden sm:flex flex-col ml-2">
          <h1 className="text-[16px] font-bold text-slate-800 leading-none">SMK Negeri 1 Surabaya</h1>
          <p className="text-[12px] text-slate-500 mt-1.5 font-medium">Sistem Manajemen Magang Siswa</p>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <div className="relative w-10 h-10 flex items-center justify-center cursor-pointer group">
              <Bell className="w-[20px] h-[20px] text-slate-500 group-hover:text-slate-800 transition-colors" />
            </div>
          } />
          <DropdownMenuContent align="end" className="w-[320px] rounded-2xl border-slate-200 p-0 overflow-hidden shadow-xl mt-2 bg-white">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
              <span className="font-bold text-[16px] text-[#1e293b]">Notifikasi</span>
              <span className="px-2.5 py-0.5 rounded-md bg-[#854D0E] text-white text-[11px] font-bold">0</span>
            </div>
            <div className="flex flex-col items-center justify-center py-14 px-6">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-[14px] text-slate-500 font-medium">Tidak ada notifikasi</p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="h-4 w-px bg-slate-200 hidden sm:block mx-1" />

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 bg-[#00BCD4] rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm transition-transform group-hover:scale-105">
                <UserCircle className="w-6 h-6" />
              </div>
              <div className="text-start hidden sm:block">
                <p className="text-[14px] font-bold text-[#1e293b] leading-tight">Admin Sistem</p>
                <p className="text-[12px] text-slate-500 font-medium">Admin</p>
              </div>
            </div>
          } />
          <DropdownMenuContent align="end" className="w-[220px] rounded-2xl border-slate-200 p-0 overflow-hidden shadow-xl mt-2 bg-white">
            <div className="px-6 py-4 bg-white">
              <p className="text-[16px] font-bold text-[#1e293b] leading-tight">Admin Sistem</p>
              <p className="text-[14px] text-slate-500 font-medium mt-1">Admin</p>
            </div>
            <DropdownMenuSeparator className="bg-slate-100 m-0" />
            <div className="p-1">
              <DropdownMenuItem 
                onClick={handleLogout}
                className="flex items-center gap-4 px-5 py-3 text-red-500 hover:bg-red-50 cursor-pointer rounded-xl group"
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
