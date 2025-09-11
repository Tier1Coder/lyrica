import { NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/route'
import { z } from 'zod'
import { safeErrorMessage } from '@/lib/utils'
import { isAdmin } from '@/lib/auth'

const BookingSchema = z.object({
  activity_type: z.string().min(1).max(50),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  start_time: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid start time'),
  end_time: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid end time'),
  max_capacity: z.number().min(1).max(100).default(1),
  price: z.number().min(0).optional(),
  location: z.string().max(500).optional(),
})

const UserBookingSchema = z.object({
  booking_id: z.string().uuid(),
  number_of_participants: z.number().min(1).max(20).default(1),
  special_requests: z.string().max(1000).optional(),
})

// GET /api/bookings - Get all available booking slots
export async function GET(request: Request) {
  try {
    const supabase = createRouteClient()
    const { searchParams } = new URL(request.url)
    const activity_type = searchParams.get('activity_type')
    const date = searchParams.get('date')

    let query = supabase
      .from('bookings')
      .select(`
        *,
        user_bookings(count)
      `)
      .eq('status', 'active')
      .order('start_time', { ascending: true })

    if (activity_type) {
      query = query.eq('activity_type', activity_type)
    }

    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      query = query
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
    }

    const { data, error } = await query

    if (error) throw error

    // Calculate available spots for each booking
    const bookingsWithAvailability = data?.map(booking => ({
      ...booking,
      available_spots: booking.max_capacity - (booking.user_bookings?.[0]?.count || 0)
    })) || []

    return NextResponse.json(bookingsWithAvailability)
  } catch (e) {
    console.error('GET /api/bookings error', e)
    return NextResponse.json({ error: safeErrorMessage() }, { status: 500 })
  }
}

// POST /api/bookings - Create a new booking slot (admin only)
export async function POST(request: Request) {
  try {
    const supabase = createRouteClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminCheck = await isAdmin(session.user.id)
    if (!adminCheck) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const json = await request.json()
    const parsed = BookingSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { start_time, end_time, ...bookingData } = parsed.data

    // Validate time range
    if (new Date(start_time) >= new Date(end_time)) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        ...bookingData,
        start_time,
        end_time,
        user_id: session.user.id, // Track who created the booking
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (e) {
    console.error('POST /api/bookings error', e)
    return NextResponse.json({ error: safeErrorMessage() }, { status: 500 })
  }
}
