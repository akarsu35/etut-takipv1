'use client'
import React from 'react'
import { Calendar, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useEtut } from '@/context/EtutContext'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

export const GlobalHeader: React.FC = () => {
  const { user, loading } = useEtut()
  const router = useRouter()

  const handleLogout = async () => {
    await authClient.signOut()
    router.push('/login')
  }

  if (loading)
    return (
      <header className="bg-white border-b sticky top-0 z-50 h-16 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </header>
    )

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-indigo-200 shadow-lg group-hover:scale-110 transition-transform">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 leading-tight">
              EtütTakip <span className="text-indigo-600">Pro</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Yönetim Sistemi
            </p>
          </div>
        </Link>

        {user ? (
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                  Hoş Geldiniz
                </p>
                <p className="text-xs font-bold text-gray-700">{user.name}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black">
                {user.name?.[0].toUpperCase()}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-rose-500 hover:bg-rose-50 px-4 py-2 rounded-xl transition-all font-bold text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Çıkış Yap</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Giriş Yap
          </Link>
        )}
      </div>
    </header>
  )
}
