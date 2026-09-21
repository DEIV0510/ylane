import Link from 'next/link';
import { and, asc, count, eq, isNull, like, type SQL } from 'drizzle-orm';
import { db } from '@/db';
import { brands, products } from '@/db/schema';
import { normalizar } from '@/lib/text';
import { TablaPrecios } from '@/components/admin/TablaPrecios';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Precios y stock' };

const POR_PAGINA = 50;

export default async function PreciosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filtro?: string; pagina?: string }>;
}) {
  const params = await searchParams;
  const pagina = Math.max(1, Number(params.pagina) || 1);

  const condiciones: SQL[] = [];
  if (params.q?.trim()) {
    for (const termino of normalizar(params.q).split(/\s+/).filter(Boolean).slice(0, 5)) {
      condiciones.push(like(products.buscador, `%${termino}%`));
    }
  }
  if (params.filtro === 'sin-precio') condiciones.push(isNull(products.precio));
  if (params.filtro === 'con-precio') condiciones.push(eq(products.activo, true));

  const donde = condiciones.length ? and(...condiciones) : undefined;

  const [filas, totalFilas] = await Promise.all([
    db
      .select({
        id: products.id,
        codigo: products.codigo,
        nombre: products.nombre,
        marca: brands.nombre,
        precio: products.precio,
        precioAnterior: products.precioAnterior,
        costo: products.costo,
        stock: products.stock,
      })
      .from(products)
      .leftJoin(brands, eq(products.marcaId, brands.id))
      .where(donde)
      .orderBy(asc(products.orden), asc(products.id))
      .limit(POR_PAGINA)
      .offset((pagina - 1) * POR_PAGINA)
      .all(),
    db.select({ total: count() }).from(products).where(donde).get(),
  ]);

  const total = totalFilas?.total ?? 0;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  const url = (numero: number) => {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.filtro) query.set('filtro', params.filtro);
    if (numero > 1) query.set('pagina', String(numero));
    return `/admin/productos/precios${query.toString() ? `?${query}` : ''}`;
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
          Catálogo
        </p>
        <h1 className="display-md mt-1">Precios y stock</h1>
        <p className="mt-2 max-w-2xl text-[0.85rem] text-[var(--surface-muted)]">
          Carga rápida de precios para varias referencias a la vez. Los campos vacíos se guardan
          como “sin definir” y la tienda los muestra como precio por confirmar.
        </p>
      </header>

      <form className="flex flex-wrap items-end gap-3 border border-[var(--surface-line)] p-4">
        <label className="min-w-52 flex-1">
          <span className="mb-1.5 block text-[0.6rem] uppercase tracking-[0.18em] text-[var(--surface-muted)]">
            Buscar
          </span>
          <input
            name="q"
            defaultValue={params.q ?? ''}
            placeholder="Nombre, código o marca"
            className="w-full border border-[var(--surface-line)] bg-[var(--surface-card)] px-3 py-2 text-sm outline-none focus:border-vino"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-[0.6rem] uppercase tracking-[0.18em] text-[var(--surface-muted)]">
            Filtro
          </span>
          <select
            name="filtro"
            defaultValue={params.filtro ?? ''}
            className="border border-[var(--surface-line)] bg-[var(--surface-card)] px-3 py-2 text-sm outline-none focus:border-vino"
          >
            <option value="">Todas</option>
            <option value="sin-precio">Sólo sin precio</option>
          </select>
        </label>
        <button
          type="submit"
          className="border border-vino bg-vino px-5 py-2.5 text-[0.68rem] uppercase tracking-[0.14em] text-marfil transition-colors hover:bg-vino-glow"
        >
          Filtrar
        </button>
      </form>

      <TablaPrecios filas={filas} total={total} pagina={pagina} paginas={paginas} />

      {paginas > 1 && (
        <nav className="flex flex-wrap justify-center gap-2" aria-label="Paginación">
          {pagina > 1 && (
            <Link
              href={url(pagina - 1)}
              className="border border-[var(--surface-line)] px-4 py-2 text-[0.7rem] uppercase tracking-[0.12em] hover:border-vino hover:text-vino"
            >
              Anterior
            </Link>
          )}
          <span className="px-4 py-2 text-[0.75rem] text-[var(--surface-muted)]">
            Página {pagina} de {paginas}
          </span>
          {pagina < paginas && (
            <Link
              href={url(pagina + 1)}
              className="border border-[var(--surface-line)] px-4 py-2 text-[0.7rem] uppercase tracking-[0.12em] hover:border-vino hover:text-vino"
            >
              Siguiente
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
