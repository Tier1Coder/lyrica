import { NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/route'
import { z } from 'zod'
import { isEmail, safeErrorMessage } from '@/lib/utils'

const ContactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().min(3).max(320).refine(isEmail, 'Invalid email'),
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
    const { name, email, message } = parsed.data
    const { error } = await supabase.from('messages').insert({
      name,
      email,
      message,
      user_id: session?.user?.id ?? null,
    })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('POST /api/contact error', e)
    return NextResponse.json({ error: safeErrorMessage() }, { status: 500 })
  }
}
