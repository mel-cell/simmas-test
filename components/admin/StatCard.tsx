import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface StatCardProps {
  title: string
  value: number | string
  description: string
  icon: React.ElementType
  color?: string
  loading?: boolean
}

export function StatCard({ title, value, description, icon: Icon, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#BFDBFE] transition-all duration-300 rounded-2xl p-6 lg:p-7 flex flex-col justify-start">
        <Skeleton className="w-10 h-10 rounded-full mb-5" />
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-3 w-40" />
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#BFDBFE] transition-all duration-300 rounded-2xl p-6 lg:p-7 flex flex-col justify-start group">
      <div className="w-10 h-10 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center mb-5 group-hover:bg-[#DBEAFE] transition-colors">
        <Icon className="w-5 h-5 text-[#2563EB]" />
      </div>
      <h4 className="text-[32px] font-extrabold text-[#1E3A8A] mb-1.5 leading-none tracking-tight">{value}</h4>
      <p className="text-[14px] font-bold text-[#0F172A] mb-1">{title}</p>
      <p className="text-[12px] text-[#64748B] font-medium leading-relaxed">{description}</p>
    </div>
  )
}
