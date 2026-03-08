import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider style={{ "--sidebar-width": "17.5rem" } as React.CSSProperties}>
      <TooltipProvider>
        <AdminSidebar />
        <SidebarInset className="bg-[#F4F7FE] flex-1">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-[1600px] mx-auto">
            {children}
          </main>
        </SidebarInset>
      </TooltipProvider>
    </SidebarProvider>
  )
}
