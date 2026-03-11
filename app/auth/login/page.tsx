'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/authService'
import { Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap, CircleCheckBig, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { profile } = await authService.signIn({ email, password })

      if (profile?.role === 'ADMIN') router.push('/admin')
      else if (profile?.role === 'GURU') router.push('/guru')
      else router.push('/siswa')
      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal login. Periksa email dan password Anda.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Column (Branding) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 flex-col justify-between p-12 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #1E3A8A 0%, #1E40AF 50%, #2563EB 100%)' }}>
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #93C5FD, transparent)' }}></div>
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #BFDBFE, transparent)' }}></div>
        
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-white/20 border border-white/30 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">SIMMAS</span>
          </Link>
        </div>

        <div className="relative z-10">
          <p className="text-white/60 text-sm font-medium tracking-widest uppercase mb-6">Sistem Management Magang Siswa</p>
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            Platform Magang <br/> Siswa SMK Modern
          </h2>
          <p className="text-white/70 text-base leading-relaxed mb-10 max-w-sm">
            Kelola seluruh aktivitas program PKL/magang secara digital, transparan, dan terukur dari satu platform.
          </p>
          
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <CircleCheckBig className="h-5 w-5 text-blue-300 shrink-0" />
              <span className="text-white/80 text-sm">Dashboard monitoring siswa real-time</span>
            </li>
            <li className="flex items-center gap-3">
              <CircleCheckBig className="h-5 w-5 text-blue-300 shrink-0" />
              <span className="text-white/80 text-sm">Logbook digital yang terstruktur</span>
            </li>
            <li className="flex items-center gap-3">
              <CircleCheckBig className="h-5 w-5 text-blue-300 shrink-0" />
              <span className="text-white/80 text-sm">Laporan magang otomatis & siap cetak</span>
            </li>
          </ul>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
            <span className="text-xs text-white/70">UKK SMK Project</span>
            <span className="text-white/40">·</span>
            <span className="text-xs font-semibold text-white">Powered by UBIG</span>
          </div>
        </div>
      </div>

      {/* Right Column (Form) */}
      <div className="flex-1 bg-[#F8FAFC] flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-[#2563EB] rounded-xl flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#0F172A] tracking-tight">SIMMAS</span>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[#0F172A] mb-1.5 tracking-tight">Selamat Datang</h1>
              <p className="text-sm text-[#475569]">Masuk ke akun SIMMAS Anda untuk melanjutkan.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-[#0F172A]">Alamat Email</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input 
                    id="email" 
                    type="email" 
                    placeholder="nama@sekolah.sch.id" 
                    autoComplete="email" 
                    className="w-full pl-10 pr-10 py-2.5 border rounded-lg text-sm text-[#0F172A] bg-white placeholder-[#94A3B8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] border-[#E2E8F0]" 
                    name="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-[#0F172A]">Password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Masukkan password" 
                    autoComplete="password" 
                    className="w-full pl-10 pr-10 py-2.5 border rounded-lg text-sm text-[#0F172A] bg-white placeholder-[#94A3B8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] border-[#E2E8F0]" 
                    name="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[#94A3B8] hover:text-[#475569] transition-colors" 
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" /> }
                    </button>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" className="w-4 h-4 rounded border-[#E2E8F0] accent-[#2563EB]" />
                  <span className="text-sm text-[#475569]">Ingat saya</span>
                </label>
                <Link href="#" className="text-sm text-[#2563EB] hover:text-[#1E40AF] font-medium transition-colors">Lupa password?</Link>
              </div>

              {error && (
                <div className="text-sm font-medium text-red-500 bg-red-50 p-3 auto-rounded-lg border border-red-100 text-center rounded-lg mt-2">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap px-4 py-2 w-full h-11 rounded-lg bg-[#2563EB] hover:bg-[#1E40AF] text-white font-semibold text-sm shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed group mt-2"
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Masuk
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>
          
          <p className="text-center text-xs text-[#94A3B8] mt-6">
            Dengan masuk, Anda menyetujui <Link className="text-[#2563EB] hover:underline" href="#">Syarat Layanan</Link> dan <Link className="text-[#2563EB] hover:underline" href="#">Kebijakan Privasi</Link> kami.
          </p>
        </div>
      </div>
    </div>
  )
}
