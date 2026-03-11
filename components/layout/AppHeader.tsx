'use client'

import { Bell, Menu, LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { authService } from '@/services/authService'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSchoolSettings } from '@/components/providers/SchoolSettingsProvider'

export function AppHeader() {
  const { toggleSidebar } = useSidebar()
  const router = useRouter()
  const [profile, setProfile] = useState<{ full_name: string, role: string } | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      const data = await authService.getProfile()
      if (data) {
        setProfile({
          full_name: data.profile?.full_name || 'User',
          role: data.profile?.role || 'Guest'
        })
      }
    }
    fetchProfile()
  }, [])

  const { settings, loading } = useSchoolSettings()

  const handleLogout = async () => {
    try {
      await authService.signOut()
      router.push('/auth/login')
    } catch (e) {
      console.error(e)
    }
  }

  const userName = profile?.full_name || 'Memuat...'
  const userRole = profile?.role || ''

  // Fallback initial character for avatar
  const initial = profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'

  return (
    <header className="h-[80px] px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] shadow-sm max-w-full">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]">
          <Menu className="w-5 h-5" />
        </Button>
        <div className="hidden sm:flex flex-col">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#94A3B8]" />
              <div className="h-4 w-32 bg-[#F1F5F9] animate-pulse rounded" />
            </div>
          ) : (
             <>
               <h1 className="text-[15px] font-bold text-[#0F172A] leading-tight flex items-center gap-2">
                 {settings?.namaSekolah || 'SMK Negeri 1 Surabaya'}
               </h1>
               <p className="text-[12px] text-[#64748B] font-medium mt-0.5">Sistem Manajemen Magang Siswa</p>
             </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6 shrink-0">
        {/* Notification Bell */}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative w-10 h-10 flex items-center justify-center cursor-pointer group border-none bg-transparent outline-none hover:bg-[#F1F5F9] rounded-full transition-all">
             <Bell className="w-5 h-5 text-[#64748B] group-hover:text-[#0F172A] transition-colors" />
             {/* Unread indicator dot (optional visual addition) */}
             <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[300px] sm:w-[320px] rounded-2xl p-0 overflow-hidden shadow-lg border border-[#E2E8F0] mt-2 bg-white z-50">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <span className="font-bold text-[14px] text-[#0F172A]">Notifikasi</span>
              <span className="px-2 py-0.5 rounded-md bg-[#DBEAFE] text-[#1E40AF] text-[10px] font-bold">0</span>
            </div>
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="w-12 h-12 rounded-full bg-[#F1F5F9] flex items-center justify-center mb-3">
                <Bell className="w-5 h-5 text-[#94A3B8]" />
              </div>
              <p className="text-[13px] text-[#64748B] font-medium text-center">Belum ada notifikasi baru</p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-[#E2E8F0] hidden sm:block mx-1" />

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 cursor-pointer group border-none bg-transparent outline-none p-1 hover:bg-[#F8FAFC] rounded-full transition-all pr-3">
            <div className="w-9 h-9 bg-[#2563EB] rounded-full flex items-center justify-center text-white shrink-0 shadow-sm transition-transform group-hover:scale-105 font-bold text-sm">
               {initial}
            </div>
            <div className="text-start hidden lg:flex flex-col">
              <p className="text-[13px] font-bold text-[#0F172A] leading-tight truncate max-w-[120px]">{userName}</p>
              <p className="text-[11px] text-[#64748B] font-medium capitalize mt-0.5">{userRole.toLowerCase()}</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[220px] rounded-2xl p-0 overflow-hidden shadow-xl border border-[#E2E8F0] mt-2 bg-white z-50">
            <div className="px-5 py-4 bg-[#F8FAFC] border-b border-[#F1F5F9]">
              <p className="text-[14px] font-bold text-[#0F172A] truncate">{userName}</p>
              <p className="text-[12px] text-[#64748B] font-medium mt-1 capitalize">{userRole.toLowerCase()}</p>
            </div>
            <div className="p-2">
              <DropdownMenuItem 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer rounded-xl group transition-all"
              >
                <LogOut className="w-4 h-4 transition-colors" />
                <span className="font-semibold text-[13px]">Keluar</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
