import { redirect } from 'next/navigation'
import { createServerClient } from './supabase/server'

export async function requireSession() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  return session
}
