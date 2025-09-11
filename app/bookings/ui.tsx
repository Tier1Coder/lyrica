"use client"
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'

interface Booking {
  id: string
  title: string
  activity_type: string
  description?: string
  start_time: string
  end_time: string
  max_capacity: number
  current_bookings: number
  available_spots: number
  price?: number
  location?: string
  status: string
}

interface UserBooking {
  id: string
  booking_reference: string
  status: string
  number_of_participants: number
  total_price?: number
  special_requests?: string
  bookings: Booking
  created_at: string
}

export default function BookingsClient() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [userBookings, setUserBookings] = useState<UserBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [bookingForm, setBookingForm] = useState({
    number_of_participants: 1,
    special_requests: ''
  })
  const [activeTab, setActiveTab] = useState<'available' | 'my-bookings'>('available')
  const [activityFilter, setActivityFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('')

  useEffect(() => {
    fetchBookings()
    fetchUserBookings()
  }, [activityFilter, dateFilter])

  const fetchBookings = async () => {
    try {
      const params = new URLSearchParams()
      if (activityFilter !== 'all') params.append('activity_type', activityFilter)
      if (dateFilter) params.append('date', dateFilter)

      const res = await fetch(`/api/bookings?${params}`)
      if (res.ok) {
        const data = await res.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserBookings = async () => {
    try {
      const res = await fetch('/api/user-bookings')
      if (res.ok) {
        const data = await res.json()
        setUserBookings(data)
      }
    } catch (error) {
      console.error('Failed to fetch user bookings:', error)
    }
  }

  const handleBook = async () => {
    if (!selectedBooking) return

    try {
      const res = await fetch('/api/user-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: selectedBooking.id,
          ...bookingForm
        })
      })

      if (res.ok) {
        const newBooking = await res.json()
        setUserBookings(prev => [newBooking, ...prev])
        setSelectedBooking(null)
        setBookingForm({ number_of_participants: 1, special_requests: '' })
        fetchBookings() // Refresh available spots
        alert('Booking confirmed! Check your email for confirmation.')
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to create booking')
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert('Failed to create booking')
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getActivityTypes = () => {
    const types = [...new Set(bookings.map(b => b.activity_type))]
    return types
  }

  if (loading) {
    return <div className="text-center py-8">Loading bookings...</div>
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'available'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Available Bookings
        </button>
        <button
          onClick={() => setActiveTab('my-bookings')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'my-bookings'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          My Bookings ({userBookings.length})
        </button>
      </div>

      {activeTab === 'available' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <div className="block text-sm font-medium mb-1">Activity Type</div>
              <select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
              >
                <option value="all">All Activities</option>
                {getActivityTypes().map(type => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="block text-sm font-medium mb-1">Date</div>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-auto"
              />
            </div>
          </div>

          {/* Available Bookings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map(booking => (
              <div key={booking.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold">{booking.title}</h3>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                    {booking.activity_type.replace('_', ' ')}
                  </span>
                </div>

                {booking.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                    {booking.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Start:</span>
                    <span>{formatDateTime(booking.start_time)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>End:</span>
                    <span>{formatDateTime(booking.end_time)}</span>
                  </div>
                  {booking.location && (
                    <div className="flex justify-between text-sm">
                      <span>Location:</span>
                      <span>{booking.location}</span>
                    </div>
                  )}
                  {booking.price && (
                    <div className="flex justify-between text-sm font-medium">
                      <span>Price:</span>
                      <span>${booking.price}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {booking.available_spots} spots left
                  </span>
                  <Button
                    onClick={() => setSelectedBooking(booking)}
                    disabled={booking.available_spots === 0}
                    className="px-3 py-1 text-sm"
                  >
                    {booking.available_spots === 0 ? 'Full' : 'Book Now'}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {bookings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No bookings available for the selected filters.</p>
            </div>
          )}
        </>
      )}

      {activeTab === 'my-bookings' && (
        <div className="space-y-4">
          {userBookings.map(booking => (
            <div key={booking.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold">{booking.bookings.title}</h3>
                  <p className="text-sm text-gray-500">Ref: {booking.booking_reference}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  booking.status === 'confirmed'
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                }`}>
                  {booking.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Activity:</strong> {booking.bookings.activity_type.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Start:</strong> {formatDateTime(booking.bookings.start_time)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>End:</strong> {formatDateTime(booking.bookings.end_time)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Participants:</strong> {booking.number_of_participants}
                  </p>
                  {booking.total_price && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Total Price:</strong> ${booking.total_price}
                    </p>
                  )}
                  {booking.bookings.location && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Location:</strong> {booking.bookings.location}
                    </p>
                  )}
                </div>
              </div>

              {booking.special_requests && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Special Requests:</strong> {booking.special_requests}
                  </p>
                </div>
              )}

              <div className="text-xs text-gray-500">
                Booked on {formatDateTime(booking.created_at)}
              </div>
            </div>
          ))}

          {userBookings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">You haven't made any bookings yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {selectedBooking && (
        <Modal
          open={true}
          onClose={() => setSelectedBooking(null)}
          title={`Book ${selectedBooking.title}`}
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Booking Details</h4>
              <div className="text-sm space-y-1">
                <p><strong>Activity:</strong> {selectedBooking.activity_type.replace('_', ' ')}</p>
                <p><strong>Time:</strong> {formatDateTime(selectedBooking.start_time)} - {formatDateTime(selectedBooking.end_time)}</p>
                {selectedBooking.location && <p><strong>Location:</strong> {selectedBooking.location}</p>}
                {selectedBooking.price && <p><strong>Price per person:</strong> ${selectedBooking.price}</p>}
              </div>
            </div>

            <div>
              <div className="block text-sm font-medium mb-1">
                Number of Participants
              </div>
              <Input
                type="number"
                min="1"
                max={selectedBooking.available_spots}
                value={bookingForm.number_of_participants}
                onChange={(e) => setBookingForm(prev => ({
                  ...prev,
                  number_of_participants: parseInt(e.target.value) || 1
                }))}
              />
            </div>

            <div>
              <div className="block text-sm font-medium mb-1">
                Special Requests (Optional)
              </div>
              <textarea
                className="w-full h-24 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm resize-vertical"
                value={bookingForm.special_requests}
                onChange={(e) => setBookingForm(prev => ({
                  ...prev,
                  special_requests: e.target.value
                }))}
                placeholder="Any special requirements or notes..."
              />
            </div>

            {selectedBooking.price && (
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                <p className="text-sm">
                  <strong>Total Cost:</strong> ${selectedBooking.price * bookingForm.number_of_participants}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button onClick={handleBook} className="flex-1">
                Confirm Booking
              </Button>
              <Button
                onClick={() => setSelectedBooking(null)}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
