import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const url = req.nextUrl
  const protectedPaths = ['/dashboard', '/blog/new']
  const isProtected = protectedPaths.some((p) => url.pathname.startsWith(p))
  if (isProtected && !session) {
    const redirectUrl = new URL('/login', url)
    redirectUrl.searchParams.set('redirect', url.pathname)
    return NextResponse.redirect(redirectUrl)
  }
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
