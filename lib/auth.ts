import { redirect } from 'next/navigation'
import { createServerClient } from './supabase/server'

export async function requireSession() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  return session
}

export async function requireAdmin() {
  const session = await requireSession()
  const supabase = createServerClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (error || !profile) {
    redirect('/dashboard')
  }

  if (profile.role !== 'admin') {
    redirect('/dashboard')
  }

  return session
}

export async function isAdmin(userId?: string) {
  const supabase = createServerClient()
  const targetUserId = userId || (await requireSession()).user.id

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', targetUserId)
    .single()

  if (error || !profile) {
    return false
  }

  return profile.role === 'admin'
}

export async function isModerator(userId?: string) {
  const supabase = createServerClient()
  const targetUserId = userId || (await requireSession()).user.id

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', targetUserId)
    .single()

  if (error || !profile) {
    return false
  }

  return profile.role === 'admin' || profile.role === 'moderator'
}

export async function getUserRole(userId?: string) {
  const supabase = createServerClient()
  const targetUserId = userId || (await requireSession()).user.id

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', targetUserId)
    .single()

  if (error || !profile) {
    return 'user'
  }

  return profile.role
}
