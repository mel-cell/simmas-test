import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface StatCardProps {
  title: string
  value: number | string
  description: string
  icon: React.ElementType
  color: string
  loading?: boolean
}

export function StatCard({ title, value, description, icon: Icon, color, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white border border-slate-100 shadow-none rounded-2xl p-6 lg:p-8 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="w-[22px] h-[22px] rounded-lg" />
        </div>
        <div>
          <Skeleton className="h-8 w-16 mb-2.5" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-100 shadow-none rounded-2xl p-6 lg:p-8 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-6">
        <p className="text-[14px] font-semibold text-slate-700">{title}</p>
        <Icon className={`w-[22px] h-[22px] ${color}`} />
      </div>
      <div>
        <h4 className="text-[28px] lg:text-[32px] font-bold text-slate-800 leading-none">{value}</h4>
        <p className="text-[12px] text-slate-500 font-medium mt-2.5">{description}</p>
      </div>
    </div>
  )
}
