'use client'

import { Bell, Menu, UserCircle, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
        {/* Notification Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors focus:outline-none">
              <Bell className="w-[18px] h-[18px] text-slate-500" />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-blue-500 rounded-full border border-white" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[320px] rounded-xl border-slate-200 p-0 overflow-hidden shadow-lg mt-2">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
              <span className="font-bold text-[14px] text-slate-800">Notifikasi</span>
              <span className="px-2 py-0.5 rounded-md bg-[#854D0E] text-white text-[10px] font-bold">0</span>
            </div>
            <div className="flex flex-col items-center justify-center py-10 px-4 bg-[#FAFAFA]">
              <Bell className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-[13px] font-medium text-slate-500">Tidak ada notifikasi</p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="h-8 w-px bg-slate-200 hidden sm:block" />

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none">
              <div className="w-10 h-10 bg-[#00A3B8] rounded-full flex items-center justify-center text-white shrink-0">
                <UserCircle className="w-5 h-5" />
              </div>
              <div className="text-start hidden sm:block">
                <p className="text-[13px] font-bold text-slate-800 leading-none">Admin Pro</p>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Admin</p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-200 p-1.5 shadow-lg mt-2">
            <DropdownMenuLabel className="font-normal px-2.5 py-2">
              <div className="flex flex-col space-y-1">
                <p className="text-[14px] font-bold text-slate-800 leading-none">Admin Pro</p>
                <p className="text-[11px] font-medium text-slate-500 leading-none">Admin</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer rounded-lg px-2.5 py-2 gap-2 mt-1"
            >
              <LogOut className="w-[18px] h-[18px]" />
              <span className="font-semibold text-[13px]">Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
