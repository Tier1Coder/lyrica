import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import AdminDashboard from '../admin/ui'

export default async function AdminPage() {
  try {
    await requireAdmin()
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage users, bookings, and system settings
        </p>
      </div>
      <AdminDashboard />
    </div>
  )
}
