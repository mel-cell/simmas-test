'use client'

import { 
  LayoutDashboard, 
  BookOpen, 
  BriefcaseBusiness
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
import { FileDown } from 'lucide-react'

const navItems = [
  {
    title: 'Dashboard',
    subtitle: 'Ringkasan aktivitas',
    url: '/siswa/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Jurnal Harian',
    subtitle: 'Catatan harian',
    url: '/siswa/jurnal',
    icon: BookOpen,
  },
  {
    title: 'Magang',
    subtitle: 'Data magang saya',
    url: '/siswa/magang',
    icon: BriefcaseBusiness,
  }
]

export function SiswaSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r-0 bg-white" variant="inset">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center shrink-0">
            <GraduationCapIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-slate-800 tracking-tight leading-tight">SIMMAS</span>
            <span className="text-[12px] font-medium text-slate-500 leading-tight">Panel Siswa</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.url)
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`
                        h-auto py-3 px-4 rounded-xl transition-all duration-200 group
                        ${isActive 
                          ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' 
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                        }
                      `}
                      tooltip={item.title}
                    >
                      <Link href={item.url} className="flex items-center gap-3 w-full">
                        <div className={`
                          flex flex-col items-center justify-center
                        `}>
                          <item.icon className="w-5 h-5 shrink-0" />
                        </div>
                        <div className="flex flex-col flex-1 truncate">
                          <span className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-slate-700'}`}>
                            {item.title}
                          </span>
                          <span className={`text-[11px] font-medium truncate ${isActive ? 'text-cyan-100' : 'text-slate-400'}`}>
                            {item.subtitle}
                          </span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/60 shadow-sm flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <FileDown className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-700 truncate">Sistem Pelaporan</span>
              <span className="text-[11px] text-slate-500 truncate">v1.0</span>
            </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

function GraduationCapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  )
}
