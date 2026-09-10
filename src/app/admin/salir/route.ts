import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * Cierra la sesión y vuelve al acceso.
 *
 * Existe además para romper un bucle: el middleware sólo comprueba la firma de
 * la cookie, así que un usuario desactivado (o con la contraseña cambiada)
 * pasaba el filtro del borde, era rechazado por `requireAdmin` y volvía a
 * empezar. Aquí la cookie se borra de verdad y el ciclo termina.
 */
export async function GET(request: Request) {
  const destino = new URL('/admin/login', request.url);
  const respuesta = NextResponse.redirect(destino);
  respuesta.cookies.delete(SESSION_COOKIE);
  return respuesta;
}
