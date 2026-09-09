import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { leads } from '@/db/schema';
import { formatFechaHora } from '@/lib/format';
import { AccionesSolicitud } from '@/components/admin/AccionesSolicitud';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Solicitudes' };

export default async function SolicitudesPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  const filtro = tipo === 'mayorista' || tipo === 'contacto' ? tipo : undefined;

  const filas = await db
    .select()
    .from(leads)
    .where(filtro ? eq(leads.tipo, filtro) : undefined)
    .orderBy(desc(leads.createdAt))
    .limit(150)
    .all();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
          Tienda
        </p>
        <h1 className="display-md mt-1">Solicitudes</h1>
        <p className="mt-1 text-[0.82rem] text-[var(--surface-muted)]">
          Formularios de contacto y de mayoristas.
        </p>
      </header>

      <nav className="flex flex-wrap gap-2">
        {[
          { valor: '', etiqueta: 'Todas' },
          { valor: 'mayorista', etiqueta: 'Mayoristas' },
          { valor: 'contacto', etiqueta: 'Contacto' },
        ].map((opcion) => (
          <Link
            key={opcion.valor}
            href={opcion.valor ? `/admin/solicitudes?tipo=${opcion.valor}` : '/admin/solicitudes'}
            className={`border px-4 py-2 text-[0.68rem] uppercase tracking-[0.12em] transition-colors ${
              (filtro ?? '') === opcion.valor
                ? 'border-vino bg-vino text-marfil'
                : 'border-[var(--surface-line)] hover:border-vino hover:text-vino'
            }`}
          >
            {opcion.etiqueta}
          </Link>
        ))}
      </nav>

      {filas.length === 0 ? (
        <p className="border border-[var(--surface-line)] p-8 text-center text-[0.85rem] text-[var(--surface-muted)]">
          Todavía no hay solicitudes.
        </p>
      ) : (
        <ul className="space-y-3">
          {filas.map((solicitud) => (
            <li
              key={solicitud.id}
              className={`border p-4 ${
                solicitud.atendido ? 'border-[var(--surface-line)] opacity-70' : 'border-vino/40'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[0.92rem]">
                    {solicitud.nombre}
                    {solicitud.empresa && (
                      <span className="text-[var(--surface-muted)]"> · {solicitud.empresa}</span>
                    )}
                  </p>
                  <p className="text-[0.74rem] text-[var(--surface-muted)]">
                    {solicitud.tipo} · {formatFechaHora(solicitud.createdAt)}
                    {solicitud.ciudad ? ` · ${solicitud.ciudad}` : ''}
                  </p>
                  <p className="mt-1 text-[0.8rem]">
                    {solicitud.telefono && <span>{solicitud.telefono}</span>}
                    {solicitud.telefono && solicitud.email && ' · '}
                    {solicitud.email && <span>{solicitud.email}</span>}
                  </p>
                </div>
                <AccionesSolicitud
                  id={solicitud.id}
                  atendido={solicitud.atendido}
                  telefono={solicitud.telefono}
                />
              </div>
              {solicitud.cantidad && (
                <p className="mt-2 text-[0.8rem] text-[var(--surface-muted)]">
                  Cantidad aproximada: {solicitud.cantidad}
                </p>
              )}
              {solicitud.mensaje && (
                <p className="mt-2 text-[0.86rem] leading-relaxed text-[var(--surface-muted)]">
                  {solicitud.mensaje}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
