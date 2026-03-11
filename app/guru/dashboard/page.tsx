'use client'

import { authService } from '@/services/authService'
import { useEffect, useState } from 'react'

export default function GuruDashboard() {
  const [profile, setProfile] = useState<{ full_name: string } | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      const data = await authService.getProfile()
      if (data) {
        setProfile({
          full_name: data.profile?.full_name || 'Guru'
        })
      }
    }
    fetchProfile()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard Guru</h1>
      <p className="mt-4 text-slate-600">Selamat datang, {profile?.full_name || 'Memuat...'}!</p>
      <div className="mt-8 p-12 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400">
        Konten Dashboard Guru sedang dikembangkan
      </div>
    </div>
  )
}
