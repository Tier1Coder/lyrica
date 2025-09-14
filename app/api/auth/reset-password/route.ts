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

    // Check if user exists (optional - Supabase will handle this)
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (userError || !user) {
      // Don't reveal if email exists or not for security
      // Just return success message
      return NextResponse.json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      })
    }

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
    })

    if (error) {
      console.error('Password reset error:', error)
      return NextResponse.json(
        { error: 'Failed to send password reset email. Please try again.' },
        { status: 500 }
      )
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
