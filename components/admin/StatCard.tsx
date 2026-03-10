import React from 'react'

interface StatCardProps {
  title: string
  value: number | string
  description: string
  icon: React.ElementType
  color: string
}

export function StatCard({ title, value, description, icon: Icon, color }: StatCardProps) {
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
