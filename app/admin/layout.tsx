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
    <SidebarProvider>
      <TooltipProvider>
        <div className="flex min-h-screen bg-slate-50/50 w-full overflow-hidden font-poppins">
          <AdminSidebar />
          <SidebarInset className="flex flex-col min-h-screen overflow-hidden">
            <AdminHeader />
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
              {children}
            </main>
          </SidebarInset>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  )
}
