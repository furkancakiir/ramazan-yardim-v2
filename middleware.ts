import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Public routes
  if (request.nextUrl.pathname === '/login') {
    if (user) {
      // Kullanıcı giriş yapmışsa profil bilgisini al ve yönlendir
      const { data: profile } = await supabase
        .from('kullanici_profilleri')
        .select('rol')
        .eq('id', user.id)
        .single()

      if (profile) {
        if (profile.rol === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url))
        } else if (profile.rol === 'mahalle_baskani') {
          return NextResponse.redirect(new URL('/mahalle-baskani', request.url))
        } else {
          return NextResponse.redirect(new URL('/kullanici', request.url))
        }
      }
    }
    return response
  }

  // Protected routes
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Rol bazlı yönlendirme kontrolü
  const { data: profile } = await supabase
    .from('kullanici_profilleri')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (!profile) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Admin route kontrolü
  if (request.nextUrl.pathname.startsWith('/admin') && profile.rol !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  // Mahalle başkanı route kontrolü
  if (request.nextUrl.pathname.startsWith('/mahalle-baskani') && profile.rol !== 'mahalle_baskani') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  // Kullanıcı route kontrolü
  if (request.nextUrl.pathname.startsWith('/kullanici') && profile.rol !== 'kullanici') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/mahalle-baskani/:path*',
    '/kullanici/:path*',
    '/login',
  ],
}
