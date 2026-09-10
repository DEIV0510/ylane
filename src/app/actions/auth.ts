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

const MAX_INTENTOS = 8;
const BLOQUEO_MINUTOS = 10;

export async function iniciarSesion(_previo: EstadoLogin, formulario: FormData): Promise<EstadoLogin> {
  const analisis = esquema.safeParse(Object.fromEntries(formulario));
  if (!analisis.success) {
    return { error: analisis.error.issues[0]?.message ?? 'Revisa los datos' };
  }
  const { email, password, destino } = analisis.data;

  const usuario = await db.select().from(users).where(eq(users.email, email)).get();

  // Freno a la fuerza bruta: tras varios fallos seguidos la cuenta descansa unos
  // minutos. Se guarda en la base para que valga aunque el sitio corra en varias
  // instancias (un contador en memoria no serviría en producción).
  if (usuario?.bloqueadoHasta && new Date(usuario.bloqueadoHasta) > new Date()) {
    const faltan = Math.ceil(
      (new Date(usuario.bloqueadoHasta).getTime() - Date.now()) / 60000,
    );
    return {
      error: `Demasiados intentos fallidos. Vuelve a intentarlo en ${faltan} ${faltan === 1 ? 'minuto' : 'minutos'}.`,
    };
  }

  // Mismo mensaje y mismo coste aproximado exista o no el usuario.
  const valido = usuario ? await verifyPassword(password, usuario.passwordHash) : false;
  if (!usuario || !valido || !usuario.activo) {
    if (usuario) {
      const intentos = usuario.intentosFallidos + 1;
      await db
        .update(users)
        .set({
          intentosFallidos: intentos,
          bloqueadoHasta:
            intentos >= MAX_INTENTOS
              ? new Date(Date.now() + BLOQUEO_MINUTOS * 60_000).toISOString()
              : usuario.bloqueadoHasta,
        })
        .where(eq(users.id, usuario.id));
    }
    return { error: 'Correo o contraseña incorrectos' };
  }

  const token = await signSession({
    uid: usuario.id,
    email: usuario.email,
    rol: usuario.rol,
    nombre: usuario.nombre,
    sv: usuario.sessionVersion,
  });

  const almacen = await cookies();
  almacen.set(SESSION_COOKIE, token, cookieOptions);

  await db
    .update(users)
    .set({ ultimoAcceso: new Date().toISOString(), intentosFallidos: 0, bloqueadoHasta: null })
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
