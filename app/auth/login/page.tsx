'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { authService } from '@/services/authService'
import { motion } from 'framer-motion'
import { GraduationCap, Lock, Mail, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      
    } catch (err: any) {
      setError(err.message || 'Gagal login. Periksa email dan password Anda.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 p-4 relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-600 rounded-2xl shadow-lg ring-4 ring-blue-100">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900">
              SIMMAS
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Sistem Informasi Manajemen Magang Siswa
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" title='Password' className="text-sm font-semibold text-slate-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 text-center"
                >
                  {error}
                </motion.p>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-base font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-[0.98] rounded-xl"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </div>
                ) : (
                  'Masuk ke Dashboard'
                )}
              </Button>
            </form>
            
            <div className="mt-8 text-center border-t border-slate-100 pt-6">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
                © 2026 Admin SIMMAS - SMK 
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
