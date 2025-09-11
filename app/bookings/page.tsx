import { notFound } from 'next/navigation'
import features from '@/config/features'
import BookingsClient from './ui'

export const dynamic = 'force-dynamic'

export default function BookingsPage() {
  if (!features.useBookings) return notFound()
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Book Your Experience</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Reserve your spot for exciting activities and experiences
        </p>
      </div>
      <BookingsClient />
    </div>
  )
}
