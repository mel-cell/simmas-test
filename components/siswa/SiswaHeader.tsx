'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Bell, User, Settings, LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { authService } from '@/services/authService'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function SiswaHeader() {
  const router = useRouter()
  const [profile, setProfile] = useState<{ full_name: string, email: string, avatar_url: string | null } | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      const data = await authService.getProfile()
      if (data) {
        setProfile({
          full_name: data.profile?.full_name || 'Siswa',
          email: data.user.email || '',
          avatar_url: null, // Replace later if avatar_url is in profile
        })
      }
    }
    fetchProfile()
  }, [])

  const userName = profile?.full_name || 'Memuat...'
  const userEmail = profile?.email || ''
  const userInitials = userName === 'Memuat...' ? '..' : userName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()

  const handleSignOut = async () => {
    try {
      await authService.signOut()
      router.push('/auth/login')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-4 md:px-6 w-full shadow-sm">
      <div className="flex items-center gap-2 flex-1">
        <SidebarTrigger className="-ml-1 w-9 h-9 text-slate-500 hover:text-slate-900 border border-slate-200/60 rounded-lg hover:bg-slate-50 transition-colors" />
        <div className="hidden lg:flex flex-col ml-2 border-l border-slate-200 pl-4">
          <h1 className="text-sm font-bold text-slate-800 leading-tight">SMK Negeri 1 Surabaya</h1>
          <p className="text-[11px] font-medium text-slate-500">Sistem Manajemen Magang Siswa</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-full p-1 pr-3 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
              <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-xs ring-2 ring-white shadow-sm overflow-hidden shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  userInitials
                )}
              </div>
              <div className="hidden md:flex flex-col items-start leading-none text-left">
                <span className="text-sm font-semibold text-slate-800">{userName}</span>
                <span className="text-[11px] font-medium text-slate-500">siswa</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl shadow-lg border-slate-200">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold text-slate-900 leading-none truncate">{userName}</p>
                <p className="text-xs text-slate-500 truncate">{userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem className="cursor-pointer text-slate-700 focus:text-slate-900 focus:bg-slate-50 rounded-lg">
              <User className="mr-2 h-4 w-4" />
              <span>Profil Saya</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-slate-700 focus:text-slate-900 focus:bg-slate-50 rounded-lg">
              <Settings className="mr-2 h-4 w-4" />
              <span>Pengaturan</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem 
              className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 rounded-lg"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
