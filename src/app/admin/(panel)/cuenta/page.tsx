import { requireAdmin } from '@/lib/auth';
import { CambiarPassword } from '@/components/admin/CambiarPassword';
import { formatFechaHora } from '@/lib/format';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Mi cuenta' };

export default async function CuentaPage() {
  const sesion = await requireAdmin();
  const usuario = await db.select().from(users).where(eq(users.id, sesion.uid)).get();

  return (
    <div className="max-w-xl space-y-8">
      <header>
        <p className="text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
          Ajustes
        </p>
        <h1 className="display-md mt-1">Mi cuenta</h1>
      </header>

      <dl className="divide-y divide-[var(--surface-line)] border border-[var(--surface-line)]">
        <div className="px-4 py-3">
          <dt className="text-[0.62rem] uppercase tracking-[0.16em] text-[var(--surface-muted)]">
            Nombre
          </dt>
          <dd className="mt-0.5 text-[0.9rem]">{usuario?.nombre}</dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-[0.62rem] uppercase tracking-[0.16em] text-[var(--surface-muted)]">
            Correo
          </dt>
          <dd className="mt-0.5 text-[0.9rem]">{usuario?.email}</dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-[0.62rem] uppercase tracking-[0.16em] text-[var(--surface-muted)]">
            Último acceso
          </dt>
          <dd className="mt-0.5 text-[0.9rem]">{formatFechaHora(usuario?.ultimoAcceso)}</dd>
        </div>
      </dl>

      <section>
        <h2 className="mb-3 text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
          Cambiar contraseña
        </h2>
        <CambiarPassword />
      </section>
    </div>
  );
}
