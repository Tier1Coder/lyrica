import { requireSession } from '@/lib/auth'

export default async function DashboardPage() {
  const session = await requireSession()
  return (
    <div className="space-y-4">
      <h1>Dashboard</h1>
      <p className="text-gray-600 dark:text-gray-300">Logged in as {session.user.email}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <h2>Quick Links</h2>
          <ul className="mt-2 list-disc list-inside text-sm">
            <li><a className="text-primary underline" href="/">Home</a></li>
            <li><a className="text-primary underline" href="/blog">Blog</a></li>
          </ul>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <h2>Account</h2>
          <p className="text-sm">User ID: {session.user.id}</p>
        </div>
      </div>
    </div>
  )
}
