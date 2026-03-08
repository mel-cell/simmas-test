import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  const url = request.nextUrl.clone();

  // 1. Jika TIDAK ada session dan mencoba akses halaman terproteksi
  if (!session && (
    url.pathname.startsWith('/admin') || 
    url.pathname.startsWith('/guru') || 
    url.pathname.startsWith('/siswa')
  )) {
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // 2. Jika SUDAH ada session dan mencoba ke halaman login/auth
  if (session && url.pathname.startsWith('/auth')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role === 'ADMIN') url.pathname = '/admin/dashboard';
    else if (profile?.role === 'GURU') url.pathname = '/guru';
    else url.pathname = '/siswa';
    
    return NextResponse.redirect(url);
  }

  // 3. Tambahkan redirect auto dari /admin ke /admin/dashboard
  if (session && url.pathname === '/admin') {
    url.pathname = '/admin/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
