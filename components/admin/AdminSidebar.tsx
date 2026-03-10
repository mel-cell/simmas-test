'use client'

import { 
  LayoutDashboard, 
  Building2, 
  GraduationCap, 
  Users, 
  History,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSchoolSettings } from '@/components/providers/SchoolSettingsProvider'
import { Loader2 } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from '@/components/ui/sidebar'


const navItems = [
  {
    title: 'Dashboard',
    subtitle: 'Ringkasan sistem',
    url: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Siswa',
    subtitle: 'Manajemen siswa',
    url: '/admin/siswa',
    icon: GraduationCap,
  },
  {
    title: 'Guru',
    subtitle: 'Manajemen guru',
    url: '/admin/guru',
    icon: Users,
  },
  {
    title: 'DUDI',
    subtitle: 'Manajemen DUDI',
    url: '/admin/dudi',
    icon: Building2,
  },
  {
    title: 'Magang',
    subtitle: 'Penempatan magang',
    url: '/admin/magang',
    icon: GraduationCap,
  },
  {
    title: 'Pengguna',
    subtitle: 'Manajemen user',
    url: '/admin/users',
    icon: Users,
  },
  {
    title: 'Activity Logs',
    subtitle: 'Riwayat aktivitas',
    url: '/admin/logs',
    icon: History,
  },
  {
    title: 'Pengaturan',
    subtitle: 'Konfigurasi sistem',
    url: '/admin/settings',
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { settings, loading } = useSchoolSettings()

  return (
    <Sidebar className="border-r border-slate-200 bg-[#FAFAFA] shadow-none">
      <SidebarHeader className="h-20 flex items-start justify-start border-b border-transparent px-8 pt-8">
        <div className="flex items-start gap-3 w-full">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-4 w-20 bg-slate-100 animate-pulse rounded" />
                <div className="h-3 w-16 bg-slate-50 animate-pulse rounded" />
              </div>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-[#00A3B8] flex items-center justify-center overflow-hidden shadow-none shrink-0 relative">
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-lg font-bold tracking-tight text-slate-800 leading-none truncate">SIMMAS</span>
                <span className="text-[12px] font-medium text-slate-500 mt-1">Panel Admin</span>
              </div>
            </>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-5 py-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      render={<Link href={item.url} />}
                      className={`h-auto py-3 rounded-2xl px-3.5 flex items-center gap-3.5 w-full transition-all duration-300 ${
                        isActive 
                          ? 'bg-[#00A3B8] text-white hover:bg-[#00A3B8] hover:text-white' 
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`.trim()}
                    >
                      <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center transition-colors ${
                        isActive ? 'bg-white/20' : 'bg-[#F1F5F9]'
                      }`}>
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[15px] font-semibold leading-none ${isActive ? 'text-white' : 'text-slate-700'}`}>{item.title}</span>
                        <span className={`text-[12px] mt-1 ${isActive ? 'text-white/80' : 'text-slate-400'}`}>{item.subtitle}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6 pb-8">
        <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 border border-slate-100/80">
          <div className="w-8 h-8 rounded-full bg-[#ECFCCB] flex items-center justify-center shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-[#65A30D]" />
          </div>
          <div className="flex flex-col gap-0.5 overflow-hidden">
            <span className="text-[13px] font-bold text-slate-800 leading-none truncate">
              {loading ? 'Memuat...' : (settings?.namaSekolah || 'SMK Negeri 6 Malang')}
            </span>
            <span className="text-[11px] font-medium text-slate-500">Sistem Pelaporan v1.0</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
