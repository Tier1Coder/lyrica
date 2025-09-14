import { NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/route'
import { z } from 'zod'
import { safeErrorMessage } from '@/lib/utils'

const ResetPasswordSchema = z.object({
  email: z.email('Please enter a valid email address'),
})

export async function POST(request: Request) {
  try {
    const supabase = await createRouteClient()
    const json = await request.json()
    const parsed = ResetPasswordSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    const { email } = parsed.data

    // Always attempt to send password reset email; Supabase will handle email existence internally
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
    })

    // Always return the same generic message, regardless of error
    if (error) {
      console.error('Password reset error:', error)
    }

    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.'
    })
  } catch (e) {
    console.error('POST /api/auth/reset-password error', e)
    return NextResponse.json(
      { error: safeErrorMessage() },
      { status: 500 }
    )
  }
}
