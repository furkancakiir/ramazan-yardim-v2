import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    await supabase.auth.exchangeCodeForSession(code)

    // Kullanıcı profilini kontrol et ve yönlendir
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
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
  }

  // Hata durumunda login'e yönlendir
  return NextResponse.redirect(new URL('/login', request.url))
}
