import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session and enforce route protection
  // Race against a 4s timeout — Vercel middleware kills at ~10s, fail fast rather than hang
  let user = null
  let timedOut = false
  try {
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
    ])
    if (result === null) {
      timedOut = true
    } else {
      user = result.data.user
    }
  } catch {
    // auth error — treat as logged out
  }

  // On timeout, pass the request through — client-side will handle auth state
  if (timedOut) {
    return supabaseResponse
  }

  const { pathname } = request.nextUrl
  const isPublicPath =
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth')

  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}
