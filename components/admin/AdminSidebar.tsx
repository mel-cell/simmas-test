'use client'

import { 
  BarChart3, 
  BookOpen, 
  Building2, 
  GraduationCap, 
  LogOut, 
  Settings, 
  UserCheck, 
  Users, 
  UserCog 
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
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar'
import { authService } from '@/services/authService'
import { useRouter } from 'next/navigation'

const navItems = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: BarChart3,
  },
  {
    title: 'Manajemen Siswa',
    url: '/admin/siswa',
    icon: Users,
  },
  {
    title: 'Manajemen Guru',
    url: '/admin/guru',
    icon: UserCheck,
  },
  {
    title: 'Manajemen DUDI',
    url: '/admin/dudi',
    icon: Building2,
  },
  {
    title: 'Manajemen Magang',
    url: '/admin/magang',
    icon: BookOpen,
  },
  {
    title: 'Manajemen User',
    url: '/admin/users',
    icon: UserCog,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await authService.signOut()
    router.push('/auth/login')
  }

  return (
    <Sidebar className="border-r border-slate-100 bg-white shadow-xl shadow-slate-100">
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-slate-100 px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center overflow-hidden">
            <span className="text-white font-black text-sm">SM</span>
          </div>
          <span className="text-xl font-bold tracking-tighter text-blue-600">SIMMAS</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-8 font-poppins">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4 px-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={`h-11 rounded-xl px-4 transition-all duration-300 ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                          : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className={`h-[18px] w-[18px] ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="text-sm font-semibold">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-100 group">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center overflow-hidden">
              <UserCog className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-none">Settings</p>
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">School Info</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 text-[13px] font-bold border border-red-100 hover:bg-red-600 hover:text-white transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
