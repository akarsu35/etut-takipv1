'use client'

import React, { useState } from 'react'
import { authClient } from '@/lib/auth-client'

import { Calendar, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const { error: loginError } = await authClient.signIn.email({
          email,
          password,
        })
        if (loginError) throw loginError
      } else {
        const { error: signUpError } = await authClient.signUp.email({
          email,
          password,
          name,
        })
        if (signUpError) throw signUpError
      }

      // Force a full page reload or window redirect to ensure context refreshes
      window.location.href = '/'
    } catch (err) {
      setError(err.message || 'Bir hata oluştu')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 md:p-12 space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <div className="bg-indigo-600 w-16 h-16 rounded-2xl shadow-indigo-200 shadow-xl flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900">
            {isLogin ? 'Tekrar Hoş Geldiniz' : 'Hesap Oluşturun'}
          </h2>
          <p className="text-gray-500 font-medium">
            {isLogin
              ? 'Etüt programınızı yönetmeye devam edin'
              : 'Öğrencileriniz için profesyonel bir takip sistemi'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-2xl text-sm font-bold border border-rose-100 animate-in shake duration-300">
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">
                Ad Soyad
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">
              E-posta Adresi
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@mail.com"
                className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">
              Şifre
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-500 font-bold text-sm hover:text-indigo-600 transition-colors"
          >
            {isLogin
              ? 'Henüz hesabınız yok mu? Hesap oluşturun'
              : 'Zaten hesabınız var mı? Giriş yapın'}
          </button>
        </div>
      </div>
    </div>
  )
}
