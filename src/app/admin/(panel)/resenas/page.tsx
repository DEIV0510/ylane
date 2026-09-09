import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { products, reviews } from '@/db/schema';
import { formatFechaHora } from '@/lib/format';
import { AccionesResena } from '@/components/admin/AccionesResena';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Reseñas' };

export default async function ResenasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const filtro = ['pendiente', 'aprobada', 'rechazada'].includes(estado ?? '') ? estado! : undefined;

  const filas = await db
    .select({
      id: reviews.id,
      nombre: reviews.nombre,
      rating: reviews.rating,
      comentario: reviews.comentario,
      estado: reviews.estado,
      createdAt: reviews.createdAt,
      producto: products.nombre,
      slug: products.slug,
    })
    .from(reviews)
    .leftJoin(products, eq(reviews.productId, products.id))
    .where(filtro ? eq(reviews.estado, filtro) : undefined)
    .orderBy(desc(reviews.createdAt))
    .limit(100)
    .all();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
          Catálogo
        </p>
        <h1 className="display-md mt-1">Reseñas</h1>
        <p className="mt-2 max-w-2xl text-[0.85rem] text-[var(--surface-muted)]">
          Toda reseña entra como pendiente y sólo se publica cuando la apruebas. No se crean
          reseñas automáticas.
        </p>
      </header>

      <nav className="flex flex-wrap gap-2">
        {[
          { valor: '', etiqueta: 'Todas' },
          { valor: 'pendiente', etiqueta: 'Pendientes' },
          { valor: 'aprobada', etiqueta: 'Aprobadas' },
          { valor: 'rechazada', etiqueta: 'Rechazadas' },
        ].map((opcion) => (
          <Link
            key={opcion.valor}
            href={opcion.valor ? `/admin/resenas?estado=${opcion.valor}` : '/admin/resenas'}
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
          No hay reseñas con ese estado.
        </p>
      ) : (
        <ul className="space-y-3">
          {filas.map((resena) => (
            <li key={resena.id} className="border border-[var(--surface-line)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[0.9rem]">
                    {resena.nombre}
                    <span className="ml-2 text-champagne">{'★'.repeat(resena.rating)}</span>
                  </p>
                  <p className="text-[0.72rem] text-[var(--surface-muted)]">
                    {resena.slug ? (
                      <Link href={`/perfumes/${resena.slug}`} target="_blank" className="hover:text-vino">
                        {resena.producto}
                      </Link>
                    ) : (
                      resena.producto
                    )}{' '}
                    · {formatFechaHora(resena.createdAt)} · {resena.estado}
                  </p>
                </div>
                <AccionesResena id={resena.id} estado={resena.estado} />
              </div>
              <p className="mt-3 text-[0.86rem] leading-relaxed text-[var(--surface-muted)]">
                {resena.comentario}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
