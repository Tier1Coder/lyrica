import { NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/route'
import { z } from 'zod'
import { safeErrorMessage } from '@/lib/utils'

const ContactSchema = z.object({
  name: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
})

export async function POST(req: Request) {
  try {
    const supabase = createRouteClient()
    const json = await req.json()
    const parsed = ContactSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { name, message } = parsed.data
    const userEmail = session.user.email

    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 })
    }

    const { error } = await supabase.from('messages').insert({
      name,
      email: userEmail,
      message,
      user_id: session.user.id,
    })

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('POST /api/contact error', e)
    return NextResponse.json({ error: safeErrorMessage() }, { status: 500 })
  }
}
