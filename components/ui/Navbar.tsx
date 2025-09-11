import Link from 'next/link'
import features from '@/config/features'
import ThemeToggle from './ThemeToggle'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import LogoutButton from './LogoutButton'
import { isAdmin } from '@/lib/auth'

export default async function Navbar() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const userIsAdmin = session ? await isAdmin(session.user.id) : false

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/70 backdrop-blur">
      <div className="container flex items-center justify-between py-3">
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="font-semibold">Home</Link>
          <Link href="/dashboard">Dashboard</Link>
          {features.useCalendar && <Link href="/calendar">Calendar</Link>}
          {features.useBookings && <Link href="/bookings">Bookings</Link>}
          {features.useMaps && <Link href="/maps">Maps</Link>}
          {features.useBlog && <Link href="/blog">Blog</Link>}
          {features.useContact && <Link href="/contact">Contact</Link>}
          {userIsAdmin && <Link href="/admin" className="text-red-600 font-medium">Admin</Link>}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {session ? (
            <>
              <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400">{session.user.email}</span>
              <LogoutButton />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link className="text-sm underline text-primary" href="/login">Login</Link>
              <Link className="text-sm underline text-primary" href="/signup">Signup</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
