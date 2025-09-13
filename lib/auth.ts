import { redirect } from 'next/navigation'
import { createServerClient } from './supabase/server'

export async function requireSession() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  return session
}

export async function requireUser() {
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/login')
  return user
}

export async function requireAdmin() {
  const user = await requireUser()
  const supabase = createServerClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    redirect('/dashboard')
  }

  if (profile.role !== 'admin') {
    redirect('/dashboard')
  }

  return user
}

export async function isAdmin(userId?: string) {
  const supabase = createServerClient()

  // If userId is provided, we still need to verify it belongs to the authenticated user
  let targetUserId: string

  if (userId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
      return false
    }
    targetUserId = user.id
  } else {
    const user = await requireUser()
    targetUserId = user.id
  }

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

  let targetUserId: string

  if (userId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
      return false
    }
    targetUserId = user.id
  } else {
    const user = await requireUser()
    targetUserId = user.id
  }

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

  let targetUserId: string

  if (userId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
      return 'user'
    }
    targetUserId = user.id
  } else {
    const user = await requireUser()
    targetUserId = user.id
  }

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
