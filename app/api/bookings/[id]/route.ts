import { NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/route'
import { safeErrorMessage } from '@/lib/utils'

// PUT /api/bookings/[id] - Update booking (admin only)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin using authenticated user data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const json = await request.json()
    const { data, error } = await supabase
      .from('bookings')
      .update({
        ...json,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (e) {
    console.error('PUT /api/bookings/[id] error', e)
    return NextResponse.json({ error: safeErrorMessage() }, { status: 500 })
  }
}

// DELETE /api/bookings/[id] - Delete booking (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin using authenticated user data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ message: 'Booking deleted successfully' })
  } catch (e) {
    console.error('DELETE /api/bookings/[id] error', e)
    return NextResponse.json({ error: safeErrorMessage() }, { status: 500 })
  }
}
