'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  loading?: boolean
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, message, loading }: DeleteConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-[20px] font-bold text-slate-800 mb-2">{title}</h3>
          <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
            {message}
          </p>
        </div>
        <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex items-center gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white text-slate-600 rounded-2xl font-bold text-[14px] hover:bg-slate-100 transition-all border border-slate-200"
          >
            Batal
          </button>
          <button 
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-2xl font-bold text-[14px] hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            Hapus
          </button>
        </div>
      </div>
    </div>
  )
}
