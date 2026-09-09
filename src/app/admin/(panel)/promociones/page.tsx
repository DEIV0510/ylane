import Link from 'next/link';
import { desc, isNotNull, sql } from 'drizzle-orm';
import { db } from '@/db';
import { coupons, products } from '@/db/schema';
import { CuponFila, CuponFormulario } from '@/components/admin/Cupones';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Cupones y promociones' };

export default async function PromocionesPage() {
  const [lista, enOferta] = await Promise.all([
    db.select().from(coupons).orderBy(desc(coupons.createdAt)).all(),
    db
      .select({ total: sql<number>`count(*)` })
      .from(products)
      .where(
        sql`${products.precioAnterior} is not null and ${products.precioAnterior} > ${products.precio}`,
      )
      .get(),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
          Contenido
        </p>
        <h1 className="display-md mt-1">Cupones y promociones</h1>
        <p className="mt-2 max-w-2xl text-[0.85rem] text-[var(--surface-muted)]">
          Los cupones se aplican en el checkout y se validan en el servidor. Las ofertas se crean
          poniendo un “precio anterior” mayor que el precio actual en cada referencia.
        </p>
      </header>

      <div className="border border-[var(--surface-line)] p-4">
        <p className="text-[0.85rem]">
          Referencias actualmente en oferta: <strong>{Number(enOferta?.total ?? 0)}</strong>
        </p>
        <Link
          href="/admin/productos/precios"
          className="mt-2 inline-block text-[0.7rem] uppercase tracking-[0.12em] text-vino hover:underline"
        >
          Editar precios →
        </Link>
      </div>

      <section>
        <h2 className="mb-3 text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
          Nuevo cupón
        </h2>
        <CuponFormulario />
      </section>

      <section className="space-y-3">
        <h2 className="text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
          Cupones existentes
        </h2>
        {lista.length === 0 ? (
          <p className="border border-[var(--surface-line)] p-6 text-[0.85rem] text-[var(--surface-muted)]">
            Todavía no hay cupones creados.
          </p>
        ) : (
          lista.map((cupon) => <CuponFila key={cupon.id} cupon={cupon} />)
        )}
      </section>
    </div>
  );
}
