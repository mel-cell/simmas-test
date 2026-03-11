import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { SiswaHeader } from '@/components/siswa/SiswaHeader'
import { SiswaSidebar } from '@/components/siswa/SiswaSidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

export default function SiswaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider style={{ "--sidebar-width": "17.5rem" } as React.CSSProperties}>
      <TooltipProvider>
        <SiswaSidebar />
        <SidebarInset className="bg-[#F4F7FE] flex-1">
          <SiswaHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-[1600px] mx-auto">
            {children}
          </main>
        </SidebarInset>
      </TooltipProvider>
    </SidebarProvider>
  )
}
