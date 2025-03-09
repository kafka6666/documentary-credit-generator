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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

  try {
    // refreshing the auth token
    await supabase.auth.getUser()
  } catch (error) {
    // Silently handle auth errors (like missing refresh token)
    // This prevents console errors for unauthenticated users
    if (error && typeof error === 'object' && 'code' in error) {
      const authError = error as { code: string };
      if (authError.code === 'refresh_token_not_found') {
        // Just continue without refreshing the session
        // This is normal for unauthenticated users
      } else {
        // Log other unexpected auth errors
        console.error('Unexpected auth error in middleware:', error);
      }
    }
  }

  return supabaseResponse
}