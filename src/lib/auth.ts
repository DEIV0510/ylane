import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { SESSION_COOKIE, verifySession, type SessionPayload } from './session';

/**
 * Lee la sesión y la revalida SIEMPRE contra la base de datos.
 * El middleware sólo hace un filtro rápido en el borde: la autorización real
 * ocurre aquí, en el servidor, en cada página y en cada acción del panel.
 */
export async function getCurrentUser(): Promise<SessionPayload | null> {
  const store = await cookies();
  const payload = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!payload) return null;

  const usuario = await db.select().from(users).where(eq(users.id, payload.uid)).get();
  if (!usuario || !usuario.activo || usuario.email !== payload.email) return null;

  return { uid: usuario.id, email: usuario.email, rol: usuario.rol, nombre: usuario.nombre };
}

/** Para páginas del panel: redirige al login si no hay sesión válida. */
export async function requireAdmin(): Promise<SessionPayload> {
  const usuario = await getCurrentUser();
  if (!usuario) redirect('/admin/login');
  return usuario;
}

/** Para acciones de servidor: lanza en vez de redirigir. */
export async function assertAdmin(): Promise<SessionPayload> {
  const usuario = await getCurrentUser();
  if (!usuario) throw new Error('No autorizado');
  return usuario;
}
