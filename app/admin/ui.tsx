'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
}

interface Booking {
  id: string
  title: string
  activity_type: string
  start_time: string
  max_capacity: number
  status: string
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'bookings'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState<string>('')

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    } else {
      fetchBookings()
    }
  }, [activeTab])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      })

      if (response.ok) {
        fetchUsers() // Refresh the list
        setSelectedUser(null)
        setNewRole('')
      }
    } catch (error) {
      console.error('Failed to update user role:', error)
    }
  }

  const deleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchBookings() // Refresh the list
      }
    } catch (error) {
      console.error('Failed to delete booking:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'users'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          User Management
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'bookings'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Booking Management
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">User Management</h2>
          <div className="bg-white dark:bg-gray-900 rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Joined</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-t">
                    <td className="px-4 py-3">{user.full_name || 'N/A'}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      {(() => {
                        let roleClass = '';
                        if (user.role === 'admin') {
                          roleClass = 'bg-red-100 text-red-800';
                        } else if (user.role === 'moderator') {
                          roleClass = 'bg-blue-100 text-blue-800';
                        } else {
                          roleClass = 'bg-gray-100 text-gray-800';
                        }
                        return (
                          <span className={`px-2 py-1 rounded text-xs ${roleClass}`}>
                            {user.role}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        onClick={() => setSelectedUser(user)}
                      >
                        Change Role
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Booking Management</h2>
          <div className="bg-white dark:bg-gray-900 rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Activity</th>
                  <th className="px-4 py-3 text-left">Date & Time</th>
                  <th className="px-4 py-3 text-left">Capacity</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id} className="border-t">
                    <td className="px-4 py-3">{booking.title}</td>
                    <td className="px-4 py-3">{booking.activity_type}</td>
                    <td className="px-4 py-3">
                      {new Date(booking.start_time).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{booking.max_capacity}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        booking.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        onClick={() => deleteBooking(booking.id)}
                        variant="danger"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {selectedUser && (
        <Modal
          open={true}
          onClose={() => setSelectedUser(null)}
          title={`Change Role for ${selectedUser.full_name || selectedUser.email}`}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="role-select" className="block text-sm font-medium mb-2">
                New Role
              </label>
              <select
                id="role-select"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select role...</option>
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => updateUserRole(selectedUser.id, newRole)}
                disabled={!newRole}
              >
                Update Role
              </Button>
              <Button
                onClick={() => setSelectedUser(null)}
                variant="secondary"
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
