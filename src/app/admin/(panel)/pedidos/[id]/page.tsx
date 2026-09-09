import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { orderItems, orders } from '@/db/schema';
import { formatCOP, formatFechaHora } from '@/lib/format';
import { EstadoPedidoControl } from '@/components/admin/EstadoPedidoControl';
import { getSettings } from '@/lib/settings';
import { mensajePedido, whatsappUrl } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pedido = await db
    .select({ numero: orders.numero })
    .from(orders)
    .where(eq(orders.id, Number(id)))
    .get();
  return { title: pedido?.numero ?? 'Pedido' };
}

export default async function PedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pedidoId = Number(id);
  if (!Number.isInteger(pedidoId)) notFound();

  const [pedido, items, ajustes] = await Promise.all([
    db.select().from(orders).where(eq(orders.id, pedidoId)).get(),
    db.select().from(orderItems).where(eq(orderItems.orderId, pedidoId)).all(),
    getSettings(),
  ]);

  if (!pedido) notFound();

  const wa = whatsappUrl(
    pedido.telefono,
    mensajePedido(
      items.map((item) => ({ nombre: item.nombre, cantidad: item.cantidad, precio: item.precio })),
      pedido.total,
      pedido.numero,
    ),
  );

  const datosCliente = [
    ['Nombre', `${pedido.nombre} ${pedido.apellido ?? ''}`.trim()],
    ['Teléfono', pedido.telefono],
    ['Correo', pedido.email],
    ['Departamento', pedido.departamento],
    ['Ciudad', pedido.ciudad],
    ['Dirección', pedido.direccion],
    ['Notas', pedido.notas],
    ['Método de pago', pedido.metodoPago],
    ['Cupón', pedido.cupon],
  ].filter((fila): fila is [string, string] => Boolean(fila[1]));

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/admin/pedidos"
            className="text-[0.68rem] uppercase tracking-[0.14em] text-[var(--surface-muted)] hover:text-vino"
          >
            ← Pedidos
          </Link>
          <h1 className="display-md mt-2">{pedido.numero}</h1>
          <p className="mt-1 text-[0.82rem] text-[var(--surface-muted)]">
            {formatFechaHora(pedido.createdAt)}
          </p>
        </div>
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-vino bg-vino px-5 py-2.5 text-[0.68rem] uppercase tracking-[0.14em] text-marfil transition-colors hover:bg-vino-glow"
          >
            Escribir al cliente
          </a>
        )}
      </header>

      <EstadoPedidoControl
        id={pedido.id}
        estado={pedido.estado}
        estadoPago={pedido.estadoPago}
        inventarioDescontado={pedido.inventarioDescontado}
      />

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section className="border border-[var(--surface-line)]">
          <h2 className="border-b border-[var(--surface-line)] px-4 py-3 text-[0.62rem] uppercase tracking-[0.2em] text-[var(--surface-muted)]">
            Referencias
          </h2>
          <ul className="divide-y divide-[var(--surface-line)]">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <span>
                  <span className="block text-[0.88rem]">{item.nombre}</span>
                  <span className="block text-[0.72rem] text-[var(--surface-muted)]">
                    {item.codigo} · {item.cantidad} × {formatCOP(item.precio)}
                  </span>
                </span>
                <span className="text-[0.88rem]">{formatCOP(item.precio * item.cantidad)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-2 border-t border-[var(--surface-line)] px-4 py-4 text-[0.86rem]">
            <div className="flex justify-between">
              <dt className="text-[var(--surface-muted)]">Subtotal</dt>
              <dd>{formatCOP(pedido.subtotal)}</dd>
            </div>
            {pedido.descuento > 0 && (
              <div className="flex justify-between">
                <dt className="text-[var(--surface-muted)]">Descuento</dt>
                <dd>−{formatCOP(pedido.descuento)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-[var(--surface-muted)]">Envío</dt>
              <dd>{pedido.envio > 0 ? formatCOP(pedido.envio) : 'Por coordinar'}</dd>
            </div>
            <div className="flex justify-between border-t border-[var(--surface-line)] pt-2">
              <dt className="text-[0.7rem] uppercase tracking-[0.18em]">Total</dt>
              <dd className="font-[family-name:var(--font-display)] text-lg">
                {formatCOP(pedido.total)}
              </dd>
            </div>
          </dl>
        </section>

        <section className="border border-[var(--surface-line)]">
          <h2 className="border-b border-[var(--surface-line)] px-4 py-3 text-[0.62rem] uppercase tracking-[0.2em] text-[var(--surface-muted)]">
            Cliente y envío
          </h2>
          <dl className="divide-y divide-[var(--surface-line)]">
            {datosCliente.map(([etiqueta, valor]) => (
              <div key={etiqueta} className="px-4 py-2.5">
                <dt className="text-[0.62rem] uppercase tracking-[0.16em] text-[var(--surface-muted)]">
                  {etiqueta}
                </dt>
                <dd className="mt-0.5 text-[0.88rem]">{valor}</dd>
              </div>
            ))}
          </dl>
          {ajustes.pago_transferencia_datos && pedido.metodoPago === 'transferencia' && (
            <p className="border-t border-[var(--surface-line)] px-4 py-3 text-[0.78rem] text-[var(--surface-muted)]">
              Datos de transferencia configurados: {ajustes.pago_transferencia_datos}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
