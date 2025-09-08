import { NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/route'
import { z } from 'zod'
import { safeErrorMessage } from '@/lib/utils'

const EventSchema = z.object({
  title: z.string().min(1).max(200),
  date: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid date'),
  description: z.string().max(1000).optional().nullable(),
})

export async function GET() {
  try {
    const supabase = createRouteClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })
    if (error) throw error
    return NextResponse.json(data)
  } catch (e) {
    console.error('GET /api/events error', e)
    return NextResponse.json({ error: safeErrorMessage() }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createRouteClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const json = await req.json()
    const parsed = EventSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    const { title, date, description } = parsed.data
    const { error } = await supabase.from('events').insert({
      title,
      event_date: date,
      description: description || null,
      user_id: session.user.id,
    })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('POST /api/events error', e)
    return NextResponse.json({ error: safeErrorMessage() }, { status: 500 })
  }
}
