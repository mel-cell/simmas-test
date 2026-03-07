'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { authService } from '@/services/authService'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { User, Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 relative overflow-hidden font-poppins">
      {/* Mesh Gradients - Exact 1:1 Replication */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#3B82F6]/10 blur-[130px] rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#2563EB]/10 blur-[130px] rounded-full translate-x-1/2 translate-y-1/2" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[450px] z-10"
      >
        <Card className="border-none shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] bg-white/80 backdrop-blur-[24px] rounded-[2rem] overflow-hidden">
          <CardContent className="p-10 md:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#2563EB] rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-[30px] font-extrabold text-[#111827] mb-2 leading-tight tracking-tight">Welcome Back</h1>
            <p className="text-[#4B5563] mb-10 text-[14px]">Sign in to your account</p>

            <form onSubmit={handleLogin} className="space-y-6 text-left">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@student.sch.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 h-[52px] border-gray-200 bg-white/70 focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 rounded-xl text-base transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" title="Password" className="block text-sm font-medium text-slate-700 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 h-[52px] border-gray-200 bg-white/70 focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 rounded-xl text-base transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm font-medium text-red-500 bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-14 text-[16px] font-semibold bg-linear-to-r from-[#3B82F6] to-[#2563EB] text-white shadow-lg shadow-blue-200 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] rounded-xl"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
            
            <p className="mt-8 text-sm text-[#4B5563]">
              Don&apos;t have an account? <span className="text-[#2563EB] font-semibold cursor-pointer hover:underline">Sign up</span>
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 w-full text-center px-8">
          <p className="text-[14px] text-gray-500 max-w-xs mx-auto leading-relaxed font-normal">
            By signing in, you agree to our <Link href="/terms" className="text-blue-600 font-medium cursor-pointer hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-600 font-medium cursor-pointer hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
