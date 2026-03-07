'use client'

import { Bell, Menu, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'

export function AdminHeader() {
  const { toggleSidebar } = useSidebar()

  return (
    <header className="h-16 border-b bg-white/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30 font-poppins">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="w-5 h-5 text-slate-600" />
        </Button>
        <div className="hidden sm:block">
          <h1 className="text-base font-bold text-slate-900 leading-none">SMK Negeri 1 Surabaya</h1>
          <p className="text-[11px] text-slate-500 mt-1">Sistem Manajemen Magang Siswa</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative group">
          <Bell className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </Button>
        
        <div className="h-8 w-[1px] bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-none">Admin Sistem</p>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">Admin</p>
          </div>
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <UserCircle className="w-6 h-6" />
          </div>
        </div>
      </div>
    </header>
  )
}
