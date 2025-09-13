import { NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/route'
import { z } from 'zod'
import { safeErrorMessage } from '@/lib/utils'

const PatchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  date: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid date').optional(),
  description: z.string().max(1000).optional().nullable(),
})

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', params.id)
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (e) {
    console.error('GET /api/events/:id error', e)
    return NextResponse.json({ error: safeErrorMessage() }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const json = await req.json()
    const parsed = PatchSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    const update: any = {}
    if (parsed.data.title) update.title = parsed.data.title
    if (parsed.data.date) update.event_date = parsed.data.date
    if ('description' in parsed.data) update.description = parsed.data.description
    const { error } = await supabase
      .from('events')
      .update(update)
      .eq('id', params.id)
      .eq('user_id', user.id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('PATCH /api/events/:id error', e)
    return NextResponse.json({ error: safeErrorMessage() }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('DELETE /api/events/:id error', e)
    return NextResponse.json({ error: safeErrorMessage() }, { status: 500 })
  }
}
