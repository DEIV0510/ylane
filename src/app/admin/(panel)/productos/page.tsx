import Link from 'next/link';
import Image from 'next/image';
import { and, asc, count, eq, isNotNull, isNull, like, sql, type SQL } from 'drizzle-orm';
import { db } from '@/db';
import { brands, productImages, products } from '@/db/schema';
import { formatCOP, GENERO_ETIQUETA_ADMIN, GENERO_SIN_ASIGNAR } from '@/lib/format';
import { normalizar } from '@/lib/text';
import { AccionesProducto } from '@/components/admin/AccionesProducto';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Productos' };

const POR_PAGINA = 30;

type Params = Promise<{
  q?: string;
  estado?: string;
  filtro?: string;
  marca?: string;
  revisar?: string;
  pagina?: string;
}>;

export default async function ProductosAdminPage({ searchParams }: { searchParams: Params }) {
  const params = await searchParams;
  const pagina = Math.max(1, Number(params.pagina) || 1);

  const condiciones: SQL[] = [];
  if (params.q?.trim()) {
    for (const termino of normalizar(params.q).split(/\s+/).filter(Boolean).slice(0, 5)) {
      condiciones.push(like(products.buscador, `%${termino}%`));
    }
  }
  if (params.estado === 'activos') condiciones.push(eq(products.activo, true));
  if (params.estado === 'inactivos') condiciones.push(eq(products.activo, false));
  if (params.filtro === 'sin-precio') condiciones.push(isNull(products.precio));
  if (params.filtro === 'destacados') condiciones.push(eq(products.destacado, true));
  if (params.filtro === 'bestsellers') condiciones.push(eq(products.bestseller, true));
  if (params.filtro === 'sin-marca') condiciones.push(isNull(products.marcaId));
  if (params.filtro === 'sin-genero') condiciones.push(eq(products.genero, GENERO_SIN_ASIGNAR));
  if (params.filtro === 'anterior') condiciones.push(isNull(products.proveedorRef));
  if (params.filtro === 'proveedor') condiciones.push(isNotNull(products.proveedorRef));
  if (params.revisar === '1') condiciones.push(eq(products.requiereRevision, true));
  if (params.marca) condiciones.push(eq(brands.slug, params.marca));

  const donde = condiciones.length ? and(...condiciones) : undefined;

  const [filas, totalFilas, listaMarcas] = await Promise.all([
    db
      .select({
        id: products.id,
        codigo: products.codigo,
        slug: products.slug,
        nombre: products.nombre,
        genero: products.genero,
        precio: products.precio,
        costo: products.costo,
        stock: products.stock,
        activo: products.activo,
        destacado: products.destacado,
        bestseller: products.bestseller,
        nuevo: products.nuevo,
        requiereRevision: products.requiereRevision,
        marca: brands.nombre,
        imagen: sql<string | null>`(
          select ${productImages.url} from ${productImages}
          where ${productImages.productId} = ${products.id}
          order by case ${productImages.tipo} when 'principal' then 0 else 1 end, ${productImages.orden}
          limit 1
        )`,
      })
      .from(products)
      .leftJoin(brands, eq(products.marcaId, brands.id))
      .where(donde)
      .orderBy(asc(products.orden), asc(products.id))
      .limit(POR_PAGINA)
      .offset((pagina - 1) * POR_PAGINA)
      .all(),
    db
      .select({ total: count() })
      .from(products)
      .leftJoin(brands, eq(products.marcaId, brands.id))
      .where(donde)
      .get(),
    db.select({ slug: brands.slug, nombre: brands.nombre }).from(brands).orderBy(asc(brands.nombre)).all(),
  ]);

  const total = totalFilas?.total ?? 0;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  const construirUrl = (cambios: Record<string, string | undefined>) => {
    const query = new URLSearchParams();
    const base = { ...params, ...cambios };
    for (const [clave, valor] of Object.entries(base)) {
      if (valor) query.set(clave, String(valor));
    }
    query.delete('pagina');
    return `/admin/productos${query.toString() ? `?${query}` : ''}`;
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
            Catálogo
          </p>
          <h1 className="display-md mt-1">Productos</h1>
          <p className="mt-1 text-[0.82rem] text-[var(--surface-muted)]">
            {total} {total === 1 ? 'referencia' : 'referencias'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/productos/precios"
            className="border border-[var(--surface-line)] px-5 py-2.5 text-[0.68rem] uppercase tracking-[0.14em] transition-colors hover:border-vino hover:text-vino"
          >
            Precios y stock
          </Link>
          <Link
            href="/admin/productos/nuevo"
            className="border border-vino bg-vino px-5 py-2.5 text-[0.68rem] uppercase tracking-[0.14em] text-marfil transition-colors hover:bg-vino-glow"
          >
            Nueva referencia
          </Link>
        </div>
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
            Estado
          </span>
          <select
            name="estado"
            defaultValue={params.estado ?? ''}
            className="border border-[var(--surface-line)] bg-[var(--surface-card)] px-3 py-2 text-sm outline-none focus:border-vino"
          >
            <option value="">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
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
            <option value="">Sin filtro</option>
            <option value="sin-precio">Sin precio</option>
            <option value="sin-genero">Sin género</option>
            <option value="sin-marca">Sin marca</option>
            <option value="proveedor">Catálogo del proveedor</option>
            <option value="anterior">Primer catálogo (oculto)</option>
            <option value="destacados">Destacados</option>
            <option value="bestsellers">Best sellers</option>
          </select>
        </label>

        <label>
          <span className="mb-1.5 block text-[0.6rem] uppercase tracking-[0.18em] text-[var(--surface-muted)]">
            Marca
          </span>
          <select
            name="marca"
            defaultValue={params.marca ?? ''}
            className="max-w-44 border border-[var(--surface-line)] bg-[var(--surface-card)] px-3 py-2 text-sm outline-none focus:border-vino"
          >
            <option value="">Todas</option>
            {listaMarcas.map((marca) => (
              <option key={marca.slug} value={marca.slug}>
                {marca.nombre}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="border border-vino bg-vino px-5 py-2.5 text-[0.68rem] uppercase tracking-[0.14em] text-marfil transition-colors hover:bg-vino-glow"
        >
          Filtrar
        </button>
        {(params.q || params.estado || params.filtro || params.marca || params.revisar) && (
          <Link
            href="/admin/productos"
            className="px-2 py-2.5 text-[0.68rem] uppercase tracking-[0.14em] text-[var(--surface-muted)] hover:text-vino"
          >
            Limpiar
          </Link>
        )}
      </form>

      <div className="overflow-x-auto border border-[var(--surface-line)]">
        <table className="w-full min-w-[52rem] text-left text-[0.84rem]">
          <thead className="border-b border-[var(--surface-line)] text-[0.6rem] uppercase tracking-[0.16em] text-[var(--surface-muted)]">
            <tr>
              <th className="px-3 py-3 font-medium">Referencia</th>
              <th className="px-3 py-3 font-medium">Marca</th>
              <th className="px-3 py-3 font-medium">Género</th>
              <th className="px-3 py-3 font-medium">Precio</th>
              <th className="px-3 py-3 font-medium">Margen</th>
              <th className="px-3 py-3 font-medium">Stock</th>
              <th className="px-3 py-3 font-medium">Estado</th>
              <th className="px-3 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--surface-line)]">
            {filas.map((fila) => (
              <tr key={fila.id} className="align-middle">
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="relative size-10 shrink-0 overflow-hidden border border-[var(--surface-line)] bg-[var(--surface-input)]">
                      {fila.imagen ? (
                        <Image src={fila.imagen} alt="" fill sizes="40px" className="object-cover" />
                      ) : (
                        <span className="flex size-full items-center justify-center text-[0.55rem] text-[var(--surface-muted)]">
                          Sin foto
                        </span>
                      )}
                    </span>
                    <span className="min-w-0">
                      <Link
                        href={`/admin/productos/${fila.id}`}
                        className="block max-w-64 truncate font-medium hover:text-vino"
                      >
                        {fila.nombre}
                      </Link>
                      <span className="block text-[0.7rem] text-[var(--surface-muted)]">
                        {fila.codigo}
                        {fila.requiereRevision && ' · requiere revisión'}
                      </span>
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-[var(--surface-muted)]">{fila.marca ?? '—'}</td>
                <td
                  className={`px-3 py-2.5 ${
                    fila.genero === GENERO_SIN_ASIGNAR ? 'text-vino' : 'text-[var(--surface-muted)]'
                  }`}
                >
                  {GENERO_ETIQUETA_ADMIN[fila.genero] ?? fila.genero}
                </td>
                <td className="px-3 py-2.5">{formatCOP(fila.precio) ?? '—'}</td>
                <td className="px-3 py-2.5 text-[var(--surface-muted)]">
                  {fila.precio != null && fila.costo != null ? formatCOP(fila.precio - fila.costo) : '—'}
                </td>
                <td className="px-3 py-2.5">{fila.stock ?? '—'}</td>
                <td className="px-3 py-2.5">
                  <span className="flex flex-wrap gap-1">
                    <Etiqueta activa={fila.activo} texto={fila.activo ? 'Activo' : 'Oculto'} />
                    {fila.destacado && <Etiqueta activa texto="Destacado" />}
                    {fila.bestseller && <Etiqueta activa texto="Best seller" />}
                    {fila.nuevo && <Etiqueta activa texto="Nuevo" />}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <AccionesProducto
                    id={fila.id}
                    slug={fila.slug}
                    activo={fila.activo}
                    destacado={fila.destacado}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filas.length === 0 && (
        <p className="border border-[var(--surface-line)] p-8 text-center text-[0.85rem] text-[var(--surface-muted)]">
          No hay referencias con esos criterios.
        </p>
      )}

      {paginas > 1 && (
        <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Paginación">
          {Array.from({ length: paginas }, (_, indice) => indice + 1)
            .filter(
              (numero) =>
                numero === 1 ||
                numero === paginas ||
                Math.abs(numero - pagina) <= 2,
            )
            .map((numero, indice, lista) => (
              <span key={numero} className="flex items-center gap-2">
                {indice > 0 && lista[indice - 1] !== numero - 1 && (
                  <span className="text-[var(--surface-muted)]">…</span>
                )}
                <Link
                  href={`${construirUrl({})}${construirUrl({}).includes('?') ? '&' : '?'}pagina=${numero}`}
                  className={`min-w-9 border px-2.5 py-1.5 text-center text-[0.75rem] transition-colors ${
                    numero === pagina
                      ? 'border-vino bg-vino text-marfil'
                      : 'border-[var(--surface-line)] hover:border-vino hover:text-vino'
                  }`}
                >
                  {numero}
                </Link>
              </span>
            ))}
        </nav>
      )}
    </div>
  );
}

function Etiqueta({ activa, texto }: { activa: boolean; texto: string }) {
  return (
    <span
      className={`inline-block border px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.1em] ${
        activa ? 'border-vino/40 text-vino' : 'border-[var(--surface-line)] text-[var(--surface-muted)]'
      }`}
    >
      {texto}
    </span>
  );
}
