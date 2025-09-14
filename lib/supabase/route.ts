import { cookies } from 'next/headers'
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'

export const createRouteClient = async () =>
  createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          const cookieStore = await cookies()
          return cookieStore.getAll()
        },
        async setAll(cookiesToSet) {
          await Promise.all(
            cookiesToSet.map(async ({ name, value, options }) => {
              const cookieStore = await cookies()
              cookieStore.set(name, value, options)
            })
          )
        },
      },
    }
  )
