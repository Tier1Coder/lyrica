import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AuthCallbackPage() {
  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Auth callback error:', error)
    redirect('/login?error=auth_callback_error')
  }

  if (data.session) {
    redirect('/dashboard')
  } else {
    redirect('/login?message=check_email')
  }
}
