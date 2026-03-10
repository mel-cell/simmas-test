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

  const { data: { user } } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();

  const isRootRoute = url.pathname === '/';
  const isAuthRoute = url.pathname.startsWith('/auth');
  const isAdminRoute = url.pathname.startsWith('/admin');
  const isGuruRoute = url.pathname.startsWith('/guru');
  const isSiswaRoute = url.pathname.startsWith('/siswa');
  const isProtectedRoute = isAdminRoute || isGuruRoute || isSiswaRoute;

  // 1. Jika TIDAK ada session dan mencoba akses halaman terproteksi atau root ('/')
  if (!user && (isProtectedRoute || isRootRoute)) {
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // 2. Jika SUDAH ada session
  if (user) {
    // Ambil data profile untuk cek role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role;

    // Tentukan dashboard url berdasarkan role
    let dashboardUrl = '/siswa';
    if (role === 'ADMIN') dashboardUrl = '/admin/dashboard';
    else if (role === 'GURU') dashboardUrl = '/guru';

    // A. Jika mencoba akses root atau auth saat sudah login, arahkan ke dashboard
    if (isRootRoute || isAuthRoute) {
      url.pathname = dashboardUrl;
      return NextResponse.redirect(url);
    }

    // B. Mencegah akses lintas role (Proteksi Role)
    if (isAdminRoute && role !== 'ADMIN') {
      url.pathname = dashboardUrl;
      return NextResponse.redirect(url);
    }
    
    if (isGuruRoute && role !== 'GURU') {
      url.pathname = dashboardUrl;
      return NextResponse.redirect(url);
    }
    
    // Asumsi selain ADMIN dan GURU adalah SISWA (jadi role "SISWA" bisa akses /siswa)
    if (isSiswaRoute && role === 'ADMIN') {
      url.pathname = dashboardUrl;
      return NextResponse.redirect(url);
    }
    if (isSiswaRoute && role === 'GURU') {
      url.pathname = dashboardUrl;
      return NextResponse.redirect(url);
    }

    // C. Tambahkan redirect auto dari /admin ke /admin/dashboard
    if (url.pathname === '/admin') {
      url.pathname = '/admin/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
