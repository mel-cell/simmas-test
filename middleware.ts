import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const url = req.nextUrl.clone()

  // 1. Jika TIDAK ada session dan mencoba akses halaman terproteksi
  if (!session && (
    url.pathname.startsWith('/admin') || 
    url.pathname.startsWith('/guru') || 
    url.pathname.startsWith('/siswa')
  )) {
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // 2. Jika SUDAH ada session dan mencoba ke halaman login/auth
  if (session && url.pathname.startsWith('/auth')) {
    // Ambil profile untuk tahu redirect ke mana
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role === 'ADMIN') url.pathname = '/admin'
    else if (profile?.role === 'GURU') url.pathname = '/guru'
    else url.pathname = '/siswa'
    
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
