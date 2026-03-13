'use client'

import { 
  LayoutDashboard, 
  Building2, 
  GraduationCap, 
  Users, 
  History,
  Settings,
  BookOpen,
  BriefcaseBusiness,
  UserCheck
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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

const adminNavItems = [
  { title: 'Dashboard', subtitle: 'Ringkasan sistem', url: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Siswa', subtitle: 'Manajemen siswa', url: '/admin/siswa', icon: GraduationCap },
  { title: 'Guru', subtitle: 'Manajemen guru', url: '/admin/guru', icon: Users },
  { title: 'DUDI', subtitle: 'Perusahaan mitra', url: '/admin/dudi', icon: Building2 },
  { title: 'Magang', subtitle: 'Penempatan magang', url: '/admin/magang', icon: BriefcaseBusiness },
  { title: 'Pengguna', subtitle: 'Manajemen user', url: '/admin/users', icon: UserCheck },
  { title: 'Activity Logs', subtitle: 'Riwayat aktivitas', url: '/admin/logs', icon: History },
  { title: 'Pengaturan', subtitle: 'Konfigurasi sistem', url: '/admin/settings', icon: Settings },
]

const guruNavItems = [
  { title: 'Dashboard', subtitle: 'Ringkasan sistem', url: '/guru/dashboard', icon: LayoutDashboard },
  { title: 'Siswa Bimbingan', subtitle: 'Manajemen magang', url: '/guru/magang', icon: Users },
  { title: 'Approval Jurnal', subtitle: 'Review laporan', url: '/guru/approval', icon: BookOpen },
]

const siswaNavItems = [
  { title: 'Dashboard', subtitle: 'Ringkasan aktivitas', url: '/siswa/dashboard', icon: LayoutDashboard },
  { title: 'Jurnal Harian', subtitle: 'Catatan harian', url: '/siswa/jurnal', icon: BookOpen },
  { title: 'Magang', subtitle: 'Data magang saya', url: '/siswa/magang', icon: BriefcaseBusiness },
]

export function AppSidebar() {
  const pathname = usePathname()

  // Tentukan item navigasi berdasarkan path saat ini
  let navItems = siswaNavItems
  let panelName = 'Panel Siswa'
  if (pathname.startsWith('/admin')) {
    navItems = adminNavItems
    panelName = 'Panel Admin'
  } else if (pathname.startsWith('/guru')) {
    navItems = guruNavItems
    panelName = 'Panel Guru'
  }

  return (
    <Sidebar className="border-r border-[#E2E8F0] bg-white shadow-none">
      <SidebarHeader className="h-20 flex items-start justify-start border-b border-transparent px-6 pt-8">
        <div className="flex items-center gap-3 w-full">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[18px] font-bold tracking-tight text-[#0F172A] leading-none mb-1">SIMMAS</span>
            <span className="text-[12px] font-medium text-[#64748B] leading-none">{panelName}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.url)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      render={<Link href={item.url} />}
                      className={`h-auto py-2.5 rounded-xl px-4 flex items-center gap-3.5 w-full transition-all duration-200 relative group overflow-hidden ${
                         isActive 
                           ? 'bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] hover:text-[#1E40AF]' 
                           : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                      }`}
                    >
                      <>
                        {/* Right vertical indicator for active state */}
                        {isActive && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#2563EB] rounded-l-full" />
                        )}

                        <div className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center transition-colors ${
                          isActive ? 'bg-[#DBEAFE]' : 'bg-[#F1F5F9] group-hover:bg-[#E2E8F0]'
                        }`}>
                          <item.icon className={`w-4 h-4 ${isActive ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
                        </div>
                        <div className="flex flex-col truncate">
                           <span className={`text-[14px] font-semibold leading-none mb-1 truncate ${isActive ? 'text-[#1E40AF]' : 'text-[#334155] group-hover:text-[#0F172A]'}`}>
                             {item.title}
                           </span>
                           <span className={`text-[11px] truncate ${isActive ? 'text-[#3B82F6]' : 'text-[#94A3B8]'}`}>
                             {item.subtitle}
                           </span>
                        </div>
                      </>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 pb-6 mt-auto border-t border-[#F1F5F9]">
        <div className="bg-[#F8FAFC] rounded-xl p-4 flex flex-col border border-[#E2E8F0]">
           <span className="text-[12px] font-bold text-[#334155] leading-none mb-1">UKK SMK Project</span>
           <span className="text-[10px] font-medium text-[#94A3B8]">Powered by UBIG</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
