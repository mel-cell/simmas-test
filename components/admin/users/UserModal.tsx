'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, RefreshCw } from 'lucide-react'
import { UserProfileData } from '@/types/admin'
import { api } from '@/lib/api'

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user?: UserProfileData | null
}

export function UserModal({ isOpen, onClose, onSuccess, user }: UserModalProps) {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'Siswa',
    password: '',
    confirmPassword: '',
    isVerified: 'Unverified'
  })

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFormData({
          fullName: user.fullName || '',
          email: user.email || '',
          role: user.role?.charAt(0).toUpperCase() + user.role?.slice(1).toLowerCase() || 'Siswa',
          password: '',
          confirmPassword: '',
          isVerified: user.isVerified ? 'Verified' : 'Unverified'
        })
      } else {
        setFormData({
          fullName: '',
          email: '',
          role: 'Siswa',
          password: '',
          confirmPassword: '',
          isVerified: 'Unverified'
        })
      }
      setPasswordError('')
    }
  }, [isOpen, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Password validation for new user
    if (!user) {
      if (!formData.password) {
        setPasswordError('Password harus diisi untuk pengguna baru')
        return
      }
      if (formData.password.length < 6) {
        setPasswordError('Password minimal 6 karakter')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setPasswordError('Konfirmasi password tidak cocok')
        return
      }
    } else {
      // If editing and standard pwd is provided
      if (formData.password && formData.password.length < 6) {
        setPasswordError('Password minimal 6 karakter')
        return
      }
      if (formData.password && formData.password !== formData.confirmPassword) {
        setPasswordError('Konfirmasi password tidak cocok')
        return
      }
    }

    try {
      setLoading(true)
      let res: { success: boolean, error?: string }
      
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role.toUpperCase(),
        password: formData.password || undefined,
        isVerified: formData.isVerified === 'Verified'
      }

      if (user) {
        res = await api.admin.updateUser(user.id, payload)
      } else {
        res = await api.admin.createUser(payload)
      }

      if (res.success) {
        onSuccess()
        onClose()
      } else {
        alert(res.error || "Gagal menyimpan data user. Hubungi administrator.")
      }
    } catch (err: unknown) {
      console.error('Failed to save user:', err)
      const errorMsg = err instanceof Error ? err.message : "Gagal menghubungi server"
      alert("Terjadi kesalahan: " + errorMsg)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative bg-[#FAFAFA] w-full max-w-[500px] rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="p-6 sm:p-8 bg-transparent flex flex-col pb-0 shrink-0">
          <h3 className="text-[22px] font-medium text-slate-800 leading-tight">
            {user ? 'Edit User' : 'Tambah User Baru'}
          </h3>
          <p className="text-[14px] text-slate-500 mt-2 font-medium">
            Lengkapi semua informasi yang diperlukan
          </p>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar bg-transparent">
          
          <div className="space-y-2">
            <label className="text-[14px] font-semimedium text-[#475569]">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input 
              required
              type="text"
              placeholder="Masukkan nama lengkap"
              className="w-full h-12 px-4 bg-white border border-[#E2E8F0] rounded-xl text-[14px] font-medium text-[#1E293B] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-semimedium text-[#475569]">
              Email <span className="text-red-500">*</span>
            </label>
            <input 
              required
              type="email"
              placeholder="Contoh: user@email.com"
              className="w-full h-12 px-4 bg-white border border-[#E2E8F0] rounded-xl text-[14px] font-medium text-[#1E293B] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-semimedium text-[#475569]">
              Role <span className="text-red-500">*</span>
            </label>
            <select 
              required
              className="w-full h-12 px-4 bg-white border border-[#E2E8F0] rounded-xl text-[14px] font-medium text-[#1E293B] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all appearance-none cursor-pointer"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="Siswa">Siswa</option>
              <option value="Guru">Guru</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="space-y-2 relative">
            <label className="text-[14px] font-semimedium text-[#475569]">
              Password {user ? '' : <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <input 
                 required={!user}
                type={showPassword ? 'text' : 'password'}
                placeholder={user ? "Kosongkan jika tidak ingin mengubah" : "Masukkan password (min. 6 karakter)"}
                className="w-full h-12 px-4 pr-12 bg-white border border-[#E2E8F0] rounded-xl text-[14px] font-medium text-[#1E293B] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2 relative">
            <label className="text-[14px] font-semimedium text-[#475569]">
              Konfirmasi Password {user ? '' : <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <input 
                required={!user || !!formData.password}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Ulangi password"
                className="w-full h-12 px-4 pr-12 bg-white border border-[#E2E8F0] rounded-xl text-[14px] font-medium text-[#1E293B] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {passwordError && (
              <p className="text-sm text-red-500 mt-1">{passwordError}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-semimedium text-[#475569]">
              Email Verification
            </label>
            <select 
              className="w-full h-12 px-4 bg-white border border-[#E2E8F0] rounded-xl text-[14px] font-medium text-[#1E293B] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/10 focus:border-[#2563EB] transition-all appearance-none cursor-pointer"
              value={formData.isVerified}
              onChange={(e) => setFormData({ ...formData, isVerified: e.target.value })}
            >
              <option value="Unverified">Unverified</option>
              <option value="Verified">Verified</option>
            </select>
          </div>

        </form>

        <div className="p-6 sm:p-8 bg-transparent border-t border-[#E2E8F0] border-dashed flex items-center gap-3 shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white text-[#475569] rounded-[14px] font-medium text-[14px] hover:bg-slate-50 transition-all border border-[#CBD5E1]"
          >
            Batal
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-[14px] font-medium text-[14px] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
          >
             {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            {user ? 'Update' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}
