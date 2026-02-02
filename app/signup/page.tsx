'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import Link from 'next/link'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const signUp = async () => {
    setLoading(true)
    const { error } = await authClient.signUp.email({
      email,
      password,
      name,
      callbackURL: '/',
    })
    if (error) {
      alert(error.message)
    } else {
      window.location.href = '/'
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] border shadow-2xl space-y-8 animate-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Kayıt Ol
          </h1>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">
            Yeni Bir Hesap Oluşturun
          </p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              İsim Soyisim
            </label>
            <input
              type="text"
              placeholder="Mert Karakuş"
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-4 border-2 border-gray-100 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none font-bold transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Email Adresi
            </label>
            <input
              type="email"
              placeholder="mert@ornek.com"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 border-2 border-gray-100 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none font-bold transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Şifre
            </label>
            <input
              type="password"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 border-2 border-gray-100 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none font-bold transition-all"
            />
          </div>

          <button
            onClick={signUp}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Hesap Oluşturuluyor...' : 'Hesap Oluştur'}
          </button>
        </div>

        <p className="text-center text-gray-400 font-bold text-xs uppercase tracking-widest">
          Zaten hesabınız var mı?{' '}
          <Link href="/login" className="text-indigo-600 underline">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  )
}
