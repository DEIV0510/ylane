import Link from 'next/link';
import { and, asc, count, eq, gt, isNotNull, isNull, lte, sql } from 'drizzle-orm';
import { db } from '@/db';
import { brands, products } from '@/db/schema';
import { formatCOP } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Inventario' };

export default async function InventarioPage() {
  const [bajo, agotados, sinControl, conStock, valorInventario] = await Promise.all([
    db
      .select({
        id: products.id,
        codigo: products.codigo,
        nombre: products.nombre,
        stock: products.stock,
        stockMinimo: products.stockMinimo,
        precio: products.precio,
        marca: brands.nombre,
      })
      .from(products)
      .leftJoin(brands, eq(products.marcaId, brands.id))
      .where(
        and(
          isNotNull(products.stock),
          gt(products.stock, 0),
          lte(products.stock, sql`coalesce(${products.stockMinimo}, 3)`),
        ),
      )
      .orderBy(asc(products.stock))
      .all(),
    db
      .select({
        id: products.id,
        codigo: products.codigo,
        nombre: products.nombre,
        marca: brands.nombre,
      })
      .from(products)
      .leftJoin(brands, eq(products.marcaId, brands.id))
      .where(and(isNotNull(products.stock), lte(products.stock, 0)))
      .orderBy(asc(products.nombre))
      .all(),
    db.select({ total: count() }).from(products).where(isNull(products.stock)).get(),
    db.select({ total: count() }).from(products).where(isNotNull(products.stock)).get(),
    db
      .select({
        valor: sql<number>`coalesce(sum(coalesce(${products.stock}, 0) * coalesce(${products.precio}, 0)), 0)`,
      })
      .from(products)
      .get(),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
          Catálogo
        </p>
        <h1 className="display-md mt-1">Inventario</h1>
        <p className="mt-2 max-w-2xl text-[0.85rem] text-[var(--surface-muted)]">
          El stock se administra por referencia. Si una referencia no tiene stock definido, la
          tienda no muestra disponibilidad y siempre se puede pedir.
        </p>
      </header>

      <section className="grid gap-px border border-[var(--surface-line)] bg-[var(--surface-line)] sm:grid-cols-2 lg:grid-cols-4">
        <Metrica etiqueta="Con control de stock" valor={String(conStock?.total ?? 0)} />
        <Metrica etiqueta="Sin control de stock" valor={String(sinControl?.total ?? 0)} />
        <Metrica etiqueta="Bajo el mínimo" valor={String(bajo.length)} />
        <Metrica
          etiqueta="Valor del inventario"
          valor={formatCOP(Number(valorInventario?.valor ?? 0)) ?? '$0'}
          nota="Stock × precio publicado"
        />
      </section>

      <Tabla
        titulo="Stock bajo"
        vacio="Ninguna referencia está por debajo de su mínimo."
        filas={bajo.map((fila) => ({
          id: fila.id,
          nombre: fila.nombre,
          codigo: fila.codigo,
          marca: fila.marca,
          detalle: `${fila.stock} unidades (mínimo ${fila.stockMinimo ?? 3})`,
        }))}
      />

      <Tabla
        titulo="Agotadas"
        vacio="No hay referencias agotadas."
        filas={agotados.map((fila) => ({
          id: fila.id,
          nombre: fila.nombre,
          codigo: fila.codigo,
          marca: fila.marca,
          detalle: 'Sin unidades',
        }))}
      />

      <p className="text-[0.82rem] text-[var(--surface-muted)]">
        Para cargar stock de forma masiva usa{' '}
        <Link href="/admin/productos/precios" className="text-vino hover:underline">
          Precios y stock
        </Link>
        .
      </p>
    </div>
  );
}

function Metrica({ etiqueta, valor, nota }: { etiqueta: string; valor: string; nota?: string }) {
  return (
    <div className="bg-[var(--surface-bg)] p-5">
      <p className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--surface-muted)]">{etiqueta}</p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-2xl">{valor}</p>
      {nota && <p className="mt-1 text-[0.72rem] text-[var(--surface-muted)]">{nota}</p>}
    </div>
  );
}

function Tabla({
  titulo,
  vacio,
  filas,
}: {
  titulo: string;
  vacio: string;
  filas: { id: number; nombre: string; codigo: string; marca: string | null; detalle: string }[];
}) {
  return (
    <section>
      <h2 className="mb-3 text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
        {titulo}
      </h2>
      {filas.length === 0 ? (
        <p className="border border-[var(--surface-line)] p-6 text-[0.85rem] text-[var(--surface-muted)]">
          {vacio}
        </p>
      ) : (
        <ul className="divide-y divide-[var(--surface-line)] border border-[var(--surface-line)]">
          {filas.map((fila) => (
            <li key={fila.id} className="flex items-center justify-between gap-4 px-4 py-2.5">
              <span className="min-w-0">
                <Link href={`/admin/productos/${fila.id}`} className="text-[0.86rem] hover:text-vino">
                  {fila.nombre}
                </Link>
                <span className="block text-[0.72rem] text-[var(--surface-muted)]">
                  {fila.codigo}
                  {fila.marca ? ` · ${fila.marca}` : ''}
                </span>
              </span>
              <span className="shrink-0 text-[0.8rem] text-[var(--surface-muted)]">{fila.detalle}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
