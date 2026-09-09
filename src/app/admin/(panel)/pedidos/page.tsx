import Link from 'next/link';
import { and, count, desc, eq, like, or, type SQL } from 'drizzle-orm';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { ESTADOS_PEDIDO, formatCOP, formatFechaHora } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pedidos' };

const POR_PAGINA = 25;

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string; pagina?: string }>;
}) {
  const params = await searchParams;
  const pagina = Math.max(1, Number(params.pagina) || 1);

  const condiciones: SQL[] = [];
  if (params.estado && ESTADOS_PEDIDO.includes(params.estado as (typeof ESTADOS_PEDIDO)[number])) {
    condiciones.push(eq(orders.estado, params.estado));
  }
  if (params.q?.trim()) {
    const termino = `%${params.q.trim()}%`;
    const busqueda = or(
      like(orders.numero, termino.toUpperCase()),
      like(orders.nombre, termino),
      like(orders.telefono, termino),
      like(orders.email, termino),
    );
    if (busqueda) condiciones.push(busqueda);
  }

  const donde = condiciones.length ? and(...condiciones) : undefined;

  const [filas, totalFilas] = await Promise.all([
    db
      .select()
      .from(orders)
      .where(donde)
      .orderBy(desc(orders.createdAt))
      .limit(POR_PAGINA)
      .offset((pagina - 1) * POR_PAGINA)
      .all(),
    db.select({ total: count() }).from(orders).where(donde).get(),
  ]);

  const total = totalFilas?.total ?? 0;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
          Tienda
        </p>
        <h1 className="display-md mt-1">Pedidos</h1>
        <p className="mt-1 text-[0.82rem] text-[var(--surface-muted)]">{total} en total</p>
      </header>

      <form className="flex flex-wrap items-end gap-3 border border-[var(--surface-line)] p-4">
        <label className="min-w-52 flex-1">
          <span className="mb-1.5 block text-[0.6rem] uppercase tracking-[0.18em] text-[var(--surface-muted)]">
            Buscar
          </span>
          <input
            name="q"
            defaultValue={params.q ?? ''}
            placeholder="Número, nombre, teléfono o correo"
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
            {ESTADOS_PEDIDO.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
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
      </form>

      {filas.length === 0 ? (
        <p className="border border-[var(--surface-line)] p-8 text-center text-[0.85rem] text-[var(--surface-muted)]">
          No hay pedidos con esos criterios.
        </p>
      ) : (
        <div className="overflow-x-auto border border-[var(--surface-line)]">
          <table className="w-full min-w-[44rem] text-left text-[0.84rem]">
            <thead className="border-b border-[var(--surface-line)] text-[0.6rem] uppercase tracking-[0.16em] text-[var(--surface-muted)]">
              <tr>
                <th className="px-3 py-3 font-medium">Pedido</th>
                <th className="px-3 py-3 font-medium">Cliente</th>
                <th className="px-3 py-3 font-medium">Fecha</th>
                <th className="px-3 py-3 font-medium">Total</th>
                <th className="px-3 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--surface-line)]">
              {filas.map((pedido) => (
                <tr key={pedido.id} className="transition-colors hover:bg-[var(--surface-input)]">
                  <td className="px-3 py-2.5">
                    <Link href={`/admin/pedidos/${pedido.id}`} className="font-medium hover:text-vino">
                      {pedido.numero}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5">
                    {pedido.nombre} {pedido.apellido ?? ''}
                    <span className="block text-[0.72rem] text-[var(--surface-muted)]">
                      {pedido.telefono}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[var(--surface-muted)]">
                    {formatFechaHora(pedido.createdAt)}
                  </td>
                  <td className="px-3 py-2.5">{formatCOP(pedido.total)}</td>
                  <td className="px-3 py-2.5">
                    <span className="border border-vino/40 px-2 py-0.5 text-[0.62rem] uppercase tracking-[0.1em] text-vino">
                      {pedido.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {paginas > 1 && (
        <nav className="flex justify-center gap-2" aria-label="Paginación">
          {Array.from({ length: paginas }, (_, indice) => indice + 1).map((numero) => (
            <Link
              key={numero}
              href={`/admin/pedidos?${new URLSearchParams({
                ...(params.q ? { q: params.q } : {}),
                ...(params.estado ? { estado: params.estado } : {}),
                pagina: String(numero),
              })}`}
              className={`min-w-9 border px-2.5 py-1.5 text-center text-[0.75rem] transition-colors ${
                numero === pagina
                  ? 'border-vino bg-vino text-marfil'
                  : 'border-[var(--surface-line)] hover:border-vino hover:text-vino'
              }`}
            >
              {numero}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
