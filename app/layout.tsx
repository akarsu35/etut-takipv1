import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { EtutProvider } from '@/context/EtutContext'
import { Navigation } from '@/components/Navigation'
import { GlobalHeader } from '@/components/GlobalHeader'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'EtütTakip Pro',
  description: 'Öğrenci Etüt Yönetim Sistemi',
}

import { Toaster } from 'react-hot-toast'

// ... existing imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} font-sans antialiased bg-slate-50 min-h-screen pb-20 md:pb-0`}
      >
        <Toaster position="top-right" reverseOrder={false} />
        <EtutProvider>
          <GlobalHeader />
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
            {children}
          </main>
        </EtutProvider>
      </body>
    </html>
  )
}
