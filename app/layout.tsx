import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navbar from '@/components/ui/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lyrica Template',
  description: 'Modular Next.js template with Supabase and Tailwind',
}

// Force dynamic rendering to avoid static generation errors when env is unset
export const dynamic = 'force-dynamic'

function ThemeScript() {
  // Avoid FOUC: set initial theme based on localStorage or system preference
  const script = `
    try {
      const ls = localStorage.getItem('theme')
      const mql = window.matchMedia('(prefers-color-scheme: dark)')
      const system = mql.matches ? 'dark' : 'light'
      const theme = ls || system
      if (theme === 'dark') document.documentElement.classList.add('dark')
    } catch {}
  `
  // eslint-disable-next-line react/no-danger
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.className} bg-bg text-fg`}>
        <ThemeScript />
        <Navbar />
        <main className="container py-8">{children}</main>
      </body>
    </html>
  )
}
