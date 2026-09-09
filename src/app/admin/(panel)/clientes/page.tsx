import { count, desc, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { customers, orders } from '@/db/schema';
import { formatCOP, formatFecha } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Clientes' };

export default async function ClientesPage() {
  // Se agrupa por teléfono: es el dato con el que el negocio identifica al cliente.
  const filas = await db
    .select({
      telefono: customers.telefono,
      nombre: sql<string>`max(${customers.nombre})`,
      email: sql<string | null>`max(${customers.email})`,
      ciudad: sql<string | null>`max(${customers.ciudad})`,
      ultimo: sql<string>`max(${customers.createdAt})`,
      pedidos: sql<number>`(select count(*) from ${orders} where ${orders.telefono} = ${customers.telefono})`,
      gastado: sql<number>`(select coalesce(sum(${orders.total}), 0) from ${orders} where ${orders.telefono} = ${customers.telefono} and ${orders.estado} != 'cancelado')`,
    })
    .from(customers)
    .groupBy(customers.telefono)
    .orderBy(desc(sql`max(${customers.createdAt})`))
    .limit(200)
    .all();

  const total = await db.select({ total: count() }).from(customers).get();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
          Tienda
        </p>
        <h1 className="display-md mt-1">Clientes</h1>
        <p className="mt-1 text-[0.82rem] text-[var(--surface-muted)]">
          {filas.length} clientes únicos · {total?.total ?? 0} registros de checkout
        </p>
      </header>

      {filas.length === 0 ? (
        <p className="border border-[var(--surface-line)] p-8 text-center text-[0.85rem] text-[var(--surface-muted)]">
          Todavía no hay clientes registrados. Se crean automáticamente con cada pedido.
        </p>
      ) : (
        <div className="overflow-x-auto border border-[var(--surface-line)]">
          <table className="w-full min-w-[44rem] text-left text-[0.84rem]">
            <thead className="border-b border-[var(--surface-line)] text-[0.6rem] uppercase tracking-[0.16em] text-[var(--surface-muted)]">
              <tr>
                <th className="px-3 py-3 font-medium">Cliente</th>
                <th className="px-3 py-3 font-medium">Contacto</th>
                <th className="px-3 py-3 font-medium">Ciudad</th>
                <th className="px-3 py-3 font-medium">Pedidos</th>
                <th className="px-3 py-3 font-medium">Total comprado</th>
                <th className="px-3 py-3 font-medium">Último</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--surface-line)]">
              {filas.map((cliente) => (
                <tr key={cliente.telefono}>
                  <td className="px-3 py-2.5">{cliente.nombre}</td>
                  <td className="px-3 py-2.5">
                    {cliente.telefono}
                    {cliente.email && (
                      <span className="block text-[0.72rem] text-[var(--surface-muted)]">
                        {cliente.email}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-[var(--surface-muted)]">{cliente.ciudad ?? '—'}</td>
                  <td className="px-3 py-2.5">{cliente.pedidos}</td>
                  <td className="px-3 py-2.5">{formatCOP(Number(cliente.gastado))}</td>
                  <td className="px-3 py-2.5 text-[var(--surface-muted)]">
                    {formatFecha(cliente.ultimo)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
