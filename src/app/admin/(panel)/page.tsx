import Link from 'next/link';
import { and, count, desc, eq, gt, isNotNull, isNull, lte, ne, sql } from 'drizzle-orm';
import { db } from '@/db';
import { customers, leads, orderItems, orders, productImages, products, reviews } from '@/db/schema';
import { getSettings } from '@/lib/settings';
import { formatCOP, formatFechaHora } from '@/lib/format';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Resumen' };

export default async function DashboardPage() {
  const ajustes = await getSettings();

  const [
    totalPedidos,
    pedidosPendientes,
    ingresos,
    totalProductos,
    activos,
    sinPrecio,
    sinImagen,
    stockBajo,
    porRevisar,
    totalClientes,
    resenasPendientes,
    solicitudesNuevas,
    vistasTotales,
    ultimosPedidos,
    masVendidos,
    masVistos,
    porEstado,
  ] = await Promise.all([
    db.select({ total: count() }).from(orders).get(),
    db.select({ total: count() }).from(orders).where(eq(orders.estado, 'pendiente')).get(),
    db
      .select({ suma: sql<number>`coalesce(sum(${orders.total}), 0)` })
      .from(orders)
      .where(ne(orders.estado, 'cancelado'))
      .get(),
    db.select({ total: count() }).from(products).get(),
    db.select({ total: count() }).from(products).where(eq(products.activo, true)).get(),
    db.select({ total: count() }).from(products).where(isNull(products.precio)).get(),
    db
      .select({ total: count() })
      .from(products)
      .leftJoin(productImages, eq(productImages.productId, products.id))
      .where(isNull(productImages.id))
      .get(),
    db
      .select({ total: count() })
      .from(products)
      .where(and(isNotNull(products.stock), lte(products.stock, sql`coalesce(${products.stockMinimo}, 3)`)))
      .get(),
    db.select({ total: count() }).from(products).where(eq(products.requiereRevision, true)).get(),
    db.select({ total: count() }).from(customers).get(),
    db.select({ total: count() }).from(reviews).where(eq(reviews.estado, 'pendiente')).get(),
    db.select({ total: count() }).from(leads).where(eq(leads.atendido, false)).get(),
    db.select({ suma: sql<number>`coalesce(sum(${products.vistas}), 0)` }).from(products).get(),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(6).all(),
    db
      .select({
        nombre: orderItems.nombre,
        codigo: orderItems.codigo,
        unidades: sql<number>`sum(${orderItems.cantidad})`,
        ingreso: sql<number>`sum(${orderItems.cantidad} * ${orderItems.precio})`,
      })
      .from(orderItems)
      .groupBy(orderItems.codigo, orderItems.nombre)
      .orderBy(desc(sql`sum(${orderItems.cantidad})`))
      .limit(6)
      .all(),
    db
      .select({ nombre: products.nombre, slug: products.slug, vistas: products.vistas })
      .from(products)
      .where(gt(products.vistas, 0))
      .orderBy(desc(products.vistas))
      .limit(6)
      .all(),
    db
      .select({ estado: orders.estado, total: count() })
      .from(orders)
      .groupBy(orders.estado)
      .all(),
  ]);

  const pedidos = totalPedidos?.total ?? 0;
  const vistas = Number(vistasTotales?.suma ?? 0);
  const conversion = vistas > 0 ? (pedidos / vistas) * 100 : null;

  const alertas = [
    !ajustes.whatsapp && {
      texto: 'Falta configurar el número de WhatsApp. Mientras esté vacío, los botones de WhatsApp no aparecen en la tienda.',
      href: '/admin/configuracion',
      accion: 'Configurar',
    },
    (sinPrecio?.total ?? 0) > 0 && {
      texto: `${sinPrecio?.total} referencias todavía no tienen precio publicado.`,
      href: '/admin/productos/precios',
      accion: 'Cargar precios',
    },
    (porRevisar?.total ?? 0) > 0 && {
      texto: `${porRevisar?.total} referencias del Excel llegaron incompletas y están inactivas.`,
      href: '/admin/productos?revisar=1',
      accion: 'Revisar',
    },
    (resenasPendientes?.total ?? 0) > 0 && {
      texto: `${resenasPendientes?.total} reseñas esperando moderación.`,
      href: '/admin/resenas',
      accion: 'Moderar',
    },
    (solicitudesNuevas?.total ?? 0) > 0 && {
      texto: `${solicitudesNuevas?.total} solicitudes sin atender.`,
      href: '/admin/solicitudes',
      accion: 'Ver',
    },
  ].filter(Boolean) as { texto: string; href: string; accion: string }[];

  return (
    <div className="space-y-10">
      <header>
        <p className="text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
          Panel
        </p>
        <h1 className="display-md mt-1">Resumen de la tienda</h1>
      </header>

      {alertas.length > 0 && (
        <section className="space-y-2">
          {alertas.map((alerta) => (
            <div
              key={alerta.texto}
              className="flex flex-wrap items-center justify-between gap-3 border border-vino/30 bg-vino/5 px-4 py-3"
            >
              <p className="text-[0.85rem]">{alerta.texto}</p>
              <Link
                href={alerta.href}
                className="shrink-0 border border-vino px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.14em] text-vino transition-colors hover:bg-vino hover:text-marfil"
              >
                {alerta.accion}
              </Link>
            </div>
          ))}
        </section>
      )}

      <section className="grid gap-px border border-[var(--surface-line)] bg-[var(--surface-line)] sm:grid-cols-2 lg:grid-cols-4">
        <Metrica etiqueta="Pedidos" valor={String(pedidos)} nota={`${pedidosPendientes?.total ?? 0} pendientes`} />
        <Metrica
          etiqueta="Ingresos registrados"
          valor={formatCOP(Number(ingresos?.suma ?? 0)) ?? '$0'}
          nota="Pedidos no cancelados"
        />
        <Metrica
          etiqueta="Referencias"
          valor={String(totalProductos?.total ?? 0)}
          nota={`${activos?.total ?? 0} activas`}
        />
        <Metrica
          etiqueta="Conversión"
          valor={conversion != null ? `${conversion.toFixed(2)}%` : '—'}
          nota={`${vistas} visitas a fichas`}
        />
        <Metrica etiqueta="Clientes" valor={String(totalClientes?.total ?? 0)} nota="Con pedido registrado" />
        <Metrica etiqueta="Sin precio" valor={String(sinPrecio?.total ?? 0)} nota="Pendientes de cargar" />
        <Metrica etiqueta="Sin imagen" valor={String(sinImagen?.total ?? 0)} nota="Muestran marcador" />
        <Metrica etiqueta="Stock bajo" valor={String(stockBajo?.total ?? 0)} nota="Bajo el mínimo" />
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
            Últimos pedidos
          </h2>
          {ultimosPedidos.length === 0 ? (
            <p className="border border-[var(--surface-line)] p-6 text-[0.85rem] text-[var(--surface-muted)]">
              Todavía no hay pedidos. Cuando entren, aparecen aquí.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--surface-line)] border border-[var(--surface-line)]">
              {ultimosPedidos.map((pedido) => (
                <li key={pedido.id}>
                  <Link
                    href={`/admin/pedidos/${pedido.id}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-[var(--surface-input)]"
                  >
                    <span className="min-w-0">
                      <span className="block text-[0.85rem]">{pedido.numero}</span>
                      <span className="block truncate text-[0.72rem] text-[var(--surface-muted)]">
                        {pedido.nombre} · {formatFechaHora(pedido.createdAt)}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[0.85rem]">{formatCOP(pedido.total)}</span>
                      <span className="block text-[0.68rem] uppercase tracking-[0.12em] text-[var(--surface-muted)]">
                        {pedido.estado}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-8">
          <div>
            <h2 className="mb-4 text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
              Más vendidos
            </h2>
            {masVendidos.length === 0 ? (
              <p className="border border-[var(--surface-line)] p-6 text-[0.85rem] text-[var(--surface-muted)]">
                Sin ventas registradas todavía.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--surface-line)] border border-[var(--surface-line)]">
                {masVendidos.map((item) => (
                  <li key={item.codigo} className="flex items-center justify-between gap-4 px-4 py-2.5">
                    <span className="min-w-0 truncate text-[0.85rem]">{item.nombre}</span>
                    <span className="shrink-0 text-[0.78rem] text-[var(--surface-muted)]">
                      {item.unidades} u · {formatCOP(Number(item.ingreso))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="mb-4 text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
              Más vistos
            </h2>
            {masVistos.length === 0 ? (
              <p className="border border-[var(--surface-line)] p-6 text-[0.85rem] text-[var(--surface-muted)]">
                Aún no hay visitas registradas a las fichas.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--surface-line)] border border-[var(--surface-line)]">
                {masVistos.map((item) => (
                  <li key={item.slug} className="flex items-center justify-between gap-4 px-4 py-2.5">
                    <Link
                      href={`/perfumes/${item.slug}`}
                      target="_blank"
                      className="min-w-0 truncate text-[0.85rem] hover:text-vino"
                    >
                      {item.nombre}
                    </Link>
                    <span className="shrink-0 text-[0.78rem] text-[var(--surface-muted)]">
                      {item.vistas} vistas
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {porEstado.length > 0 && (
        <section>
          <h2 className="mb-4 text-[0.62rem] uppercase tracking-[0.22em] text-[var(--surface-muted)]">
            Pedidos por estado
          </h2>
          <div className="flex flex-wrap gap-2">
            {porEstado.map((fila) => (
              <Link
                key={fila.estado}
                href={`/admin/pedidos?estado=${fila.estado}`}
                className="border border-[var(--surface-line)] px-4 py-2 text-[0.78rem] transition-colors hover:border-vino hover:text-vino"
              >
                {fila.estado}: <strong>{fila.total}</strong>
              </Link>
            ))}
          </div>
        </section>
      )}
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
