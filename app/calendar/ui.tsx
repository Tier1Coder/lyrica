"use client"
import { useEffect, useMemo, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface EventItem {
  id: string
  title: string
  event_date: string
  description: string | null
}

export default function CalendarClient() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = async () => {
    setError(null)
    const res = await fetch('/api/events', { cache: 'no-store' })
    if (!res.ok) {
      setError('Failed to load events')
      return
    }
    setEvents(await res.json())
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, date, description }),
    })
    setLoading(false)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setError(j?.error || 'Failed to create event')
      return
    }
    setTitle('')
    setDate('')
    setDescription('')
    fetchEvents()
  }

  const grouped = useMemo(() => {
    const byMonth: Record<string, EventItem[]> = {}
    for (const ev of events) {
      const key = new Date(ev.event_date).toLocaleString(undefined, { month: 'long', year: 'numeric' })
      byMonth[key] ||= []
      byMonth[key].push(ev)
    }
    return byMonth
  }, [events])

  const onDelete = async (id: string) => {
    const res = await fetch(`/api/events/${id}`, { method: 'DELETE' })
    if (res.ok) fetchEvents()
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onCreate} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2">
          <label htmlFor="title">Title</label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="date">Date</label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div className="sm:col-span-4">
          <label htmlFor="desc">Description</label>
          <input id="desc" className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Add Event'}</Button>
        </div>
      </form>
      {error && <p className="text-danger text-sm">{error}</p>}
      <div className="space-y-6">
        {Object.entries(grouped).map(([month, list]) => (
          <div key={month} className="space-y-2">
            <h3>{month}</h3>
            <ul className="space-y-2">
              {list.map(ev => (
                <li key={ev.id} className="flex items-center justify-between rounded-md border border-gray-200 dark:border-gray-800 p-3">
                  <div>
                    <div className="font-medium">{ev.title}</div>
                    <div className="text-xs text-gray-500">{new Date(ev.event_date).toDateString()}</div>
                    {ev.description && <div className="text-sm mt-1">{ev.description}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="danger" onClick={() => onDelete(ev.id)}>Delete</Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {events.length === 0 && <p className="text-sm text-gray-500">No events yet.</p>}
      </div>
    </div>
  )
}
