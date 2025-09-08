import { NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/route'
import { z } from 'zod'
import { safeErrorMessage } from '@/lib/utils'

const PostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  publish: z.boolean().optional(),
})

export async function GET() {
  try {
    const supabase = createRouteClient()
    // RLS allows: published posts for all, and authors see own
    const { data, error } = await supabase
      .from('posts')
      .select('id,title,published_at,inserted_at')
      .order('inserted_at', { ascending: false })
    if (error) throw error
    return NextResponse.json(data)
  } catch (e) {
    console.error('GET /api/posts error', e)
    return NextResponse.json({ error: safeErrorMessage() }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createRouteClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const json = await req.json()
    const parsed = PostSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    const { title, content, publish } = parsed.data
    const { data, error } = await supabase
      .from('posts')
      .insert({
        title,
        content,
        author_id: session.user.id,
        published_at: publish ? new Date().toISOString() : null,
      })
      .select('id')
      .single()
    if (error) throw error
    return NextResponse.json({ id: data.id })
  } catch (e) {
    console.error('POST /api/posts error', e)
    return NextResponse.json({ error: safeErrorMessage() }, { status: 500 })
  }
}
