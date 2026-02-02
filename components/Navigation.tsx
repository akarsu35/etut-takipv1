'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Users, BarChart3, LogOut, Settings } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

const navItems = [
  {
    id: 'calendar',
    href: '/',
    icon: Calendar,
    label: 'Haftalık Program',
    mobileLabel: 'Takvim',
  },
  {
    id: 'students',
    href: '/students',
    icon: Users,
    label: 'Öğrenci Portföyü',
    mobileLabel: 'Kadro',
  },
  {
    id: 'stats',
    href: '/stats',
    icon: BarChart3,
    label: 'İstatistikler',
    mobileLabel: 'Rapor',
  },
  {
    id: 'settings',
    href: '/settings',
    icon: Settings,
    label: 'Ayarlar',
    mobileLabel: 'Ayarlar',
  },
]

export const Navigation: React.FC = () => {
  const pathname = usePathname()
  const { data: session } = authClient.useSession()

  if (!session) return null

  const handleLogout = async () => {
    await authClient.signOut()
    window.location.href = '/login'
  }

  return (
    <>
      {/* Navigation (Desktop) */}
      <nav className="hidden md:flex bg-white/80 backdrop-blur-md border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between w-full">
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-black text-xs uppercase tracking-widest transition-all ${
                  pathname === item.href
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
                }`}
              >
                <item.icon
                  className={`w-4 h-4 ${pathname === item.href ? 'animate-pulse' : ''}`}
                />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {session && (
            <div className="flex items-center space-x-4">
              <span className="text-xs font-bold text-gray-500">
                {session.user.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Çıkış Yap"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Navigation (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex md:hidden justify-around py-4 px-6 z-40 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex flex-col items-center space-y-1.5 transition-all ${
              pathname === item.href
                ? 'text-indigo-600 scale-110'
                : 'text-gray-400'
            }`}
          >
            <item.icon
              className="w-7 h-7"
              strokeWidth={pathname === item.href ? 2.5 : 2}
            />
            <span className="text-[10px] font-black uppercase tracking-tighter">
              {item.mobileLabel}
            </span>
          </Link>
        ))}
      </div>
    </>
  )
}
