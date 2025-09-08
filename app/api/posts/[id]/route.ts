import { NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/route'
import { z } from 'zod'
import { safeErrorMessage } from '@/lib/utils'

const PatchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  publish: z.boolean().optional(),
})

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteClient()
    const { data, error } = await supabase.from('posts').select('*').eq('id', params.id).single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (e) {
    console.error('GET /api/posts/:id error', e)
    return NextResponse.json({ error: safeErrorMessage() }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const json = await req.json()
    const parsed = PatchSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    const update: any = {}
    if (parsed.data.title) update.title = parsed.data.title
    if (parsed.data.content) update.content = parsed.data.content
    if ('publish' in parsed.data) update.published_at = parsed.data.publish ? new Date().toISOString() : null
    const { error } = await supabase
      .from('posts')
      .update(update)
      .eq('id', params.id)
      .eq('author_id', session.user.id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('PATCH /api/posts/:id error', e)
    return NextResponse.json({ error: safeErrorMessage() }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { error } = await supabase.from('posts').delete().eq('id', params.id).eq('author_id', session.user.id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('DELETE /api/posts/:id error', e)
    return NextResponse.json({ error: safeErrorMessage() }, { status: 500 })
  }
}
