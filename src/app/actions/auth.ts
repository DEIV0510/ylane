'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { users } from '@/db/schema';
import { verifyPassword } from '@/lib/password';
import { SESSION_COOKIE, cookieOptions, signSession } from '@/lib/session';

const esquema = z.object({
  email: z.string().trim().toLowerCase().email('Correo no válido'),
  password: z.string().min(1, 'Escribe tu contraseña'),
  destino: z.string().optional(),
});

export type EstadoLogin = { error?: string } | null;

export async function iniciarSesion(_previo: EstadoLogin, formulario: FormData): Promise<EstadoLogin> {
  const analisis = esquema.safeParse(Object.fromEntries(formulario));
  if (!analisis.success) {
    return { error: analisis.error.issues[0]?.message ?? 'Revisa los datos' };
  }
  const { email, password, destino } = analisis.data;

  const usuario = await db.select().from(users).where(eq(users.email, email)).get();

  // Mismo mensaje y mismo coste aproximado exista o no el usuario.
  const valido = usuario ? await verifyPassword(password, usuario.passwordHash) : false;
  if (!usuario || !valido || !usuario.activo) {
    return { error: 'Correo o contraseña incorrectos' };
  }

  const token = await signSession({
    uid: usuario.id,
    email: usuario.email,
    rol: usuario.rol,
    nombre: usuario.nombre,
  });

  const almacen = await cookies();
  almacen.set(SESSION_COOKIE, token, cookieOptions);

  await db
    .update(users)
    .set({ ultimoAcceso: new Date().toISOString() })
    .where(eq(users.id, usuario.id));

  // Sólo se aceptan rutas internas del panel como destino.
  const ruta = destino && /^\/admin(\/|$)/.test(destino) ? destino : '/admin';
  redirect(ruta);
}

export async function cerrarSesion() {
  const almacen = await cookies();
  almacen.delete(SESSION_COOKIE);
  redirect('/admin/login');
}
