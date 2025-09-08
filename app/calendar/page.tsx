import { notFound } from 'next/navigation'
import features from '@/config/features'
import CalendarClient from './ui'

export const dynamic = 'force-dynamic'

export default function CalendarPage() {
  if (!features.useCalendar) return notFound()
  return (
    <div className="space-y-4">
      <h1>Calendar</h1>
      <CalendarClient />
    </div>
  )
}
