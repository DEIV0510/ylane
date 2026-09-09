import Link from 'next/link';
import { asc, count, eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { brands, products } from '@/db/schema';
import { MarcaFormulario, MarcaFila, AsignarMarca } from '@/components/admin/Marcas';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Marcas' };

export default async function MarcasAdminPage() {
  const [lista, sinMarca] = await Promise.all([
    db
      .select({
        id: brands.id,
        nombre: brands.nombre,
        slug: brands.slug,
        origen: brands.origen,
        descripcion: brands.descripcion,
        total: count(products.id),
      })
      .from(brands)
      .leftJoin(products, eq(products.marcaId, brands.id))
      .groupBy(brands.id)
      .orderBy(asc(brands.nombre))
      .all(),
    db
      .select({ id: products.id, codigo: products.codigo, nombre: products.nombre })
      .from(products)
      .where(isNull(products.marcaId))
      .orderBy(asc(products.nombre))
      .all(),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
          Catálogo
        </p>
        <h1 className="display-md mt-1">Marcas</h1>
        <p className="mt-2 max-w-2xl text-[0.85rem] text-[var(--surface-muted)]">
          {lista.length} marcas. La marca sólo se asignó automáticamente cuando aparecía
          literalmente en el nombre del Excel; el resto lo defines tú aquí.
        </p>
      </header>

      {sinMarca.length > 0 && (
        <section className="border border-vino/30 bg-vino/5 p-5">
          <h2 className="font-[family-name:var(--font-display)] text-lg">
            {sinMarca.length} referencias sin marca
          </h2>
          <p className="mt-1 text-[0.8rem] text-[var(--surface-muted)]">
            Selecciona varias y asígnales una marca de una sola vez.
          </p>
          <div className="mt-4">
            <AsignarMarca marcas={lista.map((m) => ({ id: m.id, nombre: m.nombre }))} productos={sinMarca} />
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
          Nueva marca
        </h2>
        <MarcaFormulario />
      </section>

      <section>
        <h2 className="mb-3 text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
          Marcas del catálogo
        </h2>
        <ul className="divide-y divide-[var(--surface-line)] border border-[var(--surface-line)]">
          {lista.map((marca) => (
            <MarcaFila key={marca.id} marca={marca} />
          ))}
        </ul>
        <p className="mt-3 text-[0.78rem] text-[var(--surface-muted)]">
          Al eliminar una marca, sus referencias quedan sin marca (no se borran).{' '}
          <Link href="/admin/productos?filtro=sin-marca" className="text-vino hover:underline">
            Ver referencias sin marca
          </Link>
        </p>
      </section>
    </div>
  );
}
