import Link from 'next/link'
import features from '@/config/features'

export default function HomePage() {
  return (
    <div className="space-y-6">
      <section>
        <h1>Welcome</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          This is a reusable Next.js template with modular features. Toggle modules in <code>config/features.ts</code>.
        </p>
      </section>
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <h2>Core</h2>
          <ul className="mt-2 list-disc list-inside text-sm">
            <li><Link className="text-primary underline" href="/login">Login</Link> / <Link className="text-primary underline" href="/signup">Signup</Link></li>
            <li><Link className="text-primary underline" href="/dashboard">Dashboard</Link> (protected)</li>
          </ul>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <h2>Modules</h2>
          <ul className="mt-2 list-disc list-inside text-sm">
            {features.useCalendar && <li><Link className="text-primary underline" href="/calendar">Calendar</Link></li>}
            {features.useBookings && <li><Link className="text-primary underline" href="/bookings">Bookings</Link></li>}
            {features.useMaps && <li><Link className="text-primary underline" href="/maps">Maps</Link></li>}
            {features.useBlog && <li><Link className="text-primary underline" href="/blog">Blog</Link></li>}
            {features.useContact && <li><Link className="text-primary underline" href="/contact">Contact</Link></li>}
          </ul>
        </div>
      </section>
    </div>
  )
}
