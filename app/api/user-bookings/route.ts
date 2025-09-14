import { NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/route'
import { z } from 'zod'
import { safeErrorMessage } from '@/lib/utils'

const CreateBookingSchema = z.object({
  booking_id: z.uuid(),
  number_of_participants: z.number().min(1).max(20).default(1),
  special_requests: z.string().max(1000).optional(),
})

// GET /api/user-bookings - Get user's bookings
export async function GET() {
  try {
    const supabase = await createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('user_bookings')
      .select(`
        *,
        bookings (
          id,
          title,
          activity_type,
          start_time,
          end_time,
          location,
          price
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (e) {
    console.error('GET /api/user-bookings error', e)
    return NextResponse.json({ error: safeErrorMessage() }, { status: 500 })
  }
}

// POST /api/user-bookings - Create a new booking reservation
export async function POST(request: Request) {
  try {
    const supabase = await createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()
    const parsed = CreateBookingSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { booking_id, number_of_participants, special_requests } = parsed.data

    // Check if the booking slot exists and is active
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, user_bookings(count)')
      .eq('id', booking_id)
      .eq('status', 'active')
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking slot not found or unavailable' }, { status: 404 })
    }

    // Check availability
    const currentBookings = booking.user_bookings?.[0]?.count || 0
    if (currentBookings + number_of_participants > booking.max_capacity) {
      return NextResponse.json({ error: 'Not enough spots available' }, { status: 400 })
    }

    // Generate unique booking reference
    const bookingReference = `BK${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    // Calculate total price
    const totalPrice = booking.price ? booking.price * number_of_participants : null

    // Create the user booking
    const { data, error } = await supabase
      .from('user_bookings')
      .insert({
        user_id: user.id,
        booking_id,
        booking_reference: bookingReference,
        number_of_participants,
        special_requests,
        total_price: totalPrice,
      })
      .select(`
        *,
        bookings (
          id,
          title,
          activity_type,
          start_time,
          end_time,
          location,
          price
        )
      `)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (e) {
    console.error('POST /api/user-bookings error', e)
    return NextResponse.json({ error: safeErrorMessage() }, { status: 500 })
  }
}
