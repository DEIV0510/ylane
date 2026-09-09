import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/session';

/**
 * Filtro rápido en el borde para /admin.
 * Es la PRIMERA barrera, no la única: cada página y cada acción del panel
 * vuelve a validar la sesión contra la base de datos (src/lib/auth.ts).
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin/login') {
    const sesion = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
    if (sesion) return NextResponse.redirect(new URL('/admin', request.url));
    return NextResponse.next();
  }

  const sesion = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!sesion) {
    const destino = new URL('/admin/login', request.url);
    if (pathname !== '/admin') destino.searchParams.set('destino', pathname);
    return NextResponse.redirect(destino);
  }

  const respuesta = NextResponse.next();
  respuesta.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return respuesta;
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
