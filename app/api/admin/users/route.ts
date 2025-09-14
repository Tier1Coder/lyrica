import { NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/route'
import { safeErrorMessage } from '@/lib/utils'

// GET /api/admin/users - Get all users (admin only)
export async function GET(request: Request) {
  try {
    const supabase = await createRouteClient()
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

    // Get all users with their profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (e) {
    console.error('GET /api/admin/users error', e)
    return NextResponse.json({ error: safeErrorMessage() }, { status: 500 })
  }
}
