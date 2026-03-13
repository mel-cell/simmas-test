import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppHeader } from '@/components/layout/AppHeader'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

export default function GuruLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider style={{ "--sidebar-width": "17.5rem" } as React.CSSProperties}>
      <TooltipProvider>
        <AppSidebar />
        <SidebarInset className="bg-[#F8FAFC] flex-1 overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-y-auto p-6 md:p-8 w-full font-sans">
            {children}
          </main>
        </SidebarInset>
      </TooltipProvider>
    </SidebarProvider>
  )
}
