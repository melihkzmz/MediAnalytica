import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const authStatus = request.cookies.get('auth_status')?.value;
    const userRole = request.cookies.get('user_role')?.value;
    const { pathname } = request.nextUrl;

    // 1. Eğer giriş yapılmamışsa ve dashboard sayfalarına giriliyorsa login'e at
    if (!authStatus && (pathname.startsWith('/dashboard') || pathname.startsWith('/doctor-dashboard'))) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. Eğer giriş yapılmışsa ama yanlış role sahipse yönlendir
    if (authStatus === 'true') {
        // Hasta doktor paneline girmeye çalışırsa
        if (userRole === 'hasta' && pathname.startsWith('/doctor-dashboard')) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        
        // Doktor hasta paneline girmeye çalışırsa (isteğe bağlı, ama tutarlılık için)
        if (userRole === 'doktor' && pathname.startsWith('/dashboard') && !pathname.startsWith('/doctor-dashboard')) {
            return NextResponse.redirect(new URL('/doctor-dashboard', request.url));
        }
        
        // Giriş yapmış kullanıcı login sayfasına girmeye çalışırsa
        if (pathname === '/login') {
            const dest = userRole === 'doktor' ? '/doctor-dashboard' : '/dashboard';
            return NextResponse.redirect(new URL(dest, request.url));
        }
    }

    return NextResponse.next();
}

// Sadece bu yollarda çalışması için matcher ekliyoruz
export const config = {
    matcher: ['/dashboard/:path*', '/doctor-dashboard/:path*', '/login'],
};
