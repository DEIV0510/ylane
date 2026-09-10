'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCarrito } from '@/components/cart/CartProvider';
import { useConfig } from '@/components/ConfigProvider';
import { ProductPlaceholder } from '@/components/product/ProductPlaceholder';
import { Button, ExternalButton } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Bits';
import { ButtonLink } from '@/components/ui/Button';
import { formatCOP } from '@/lib/format';
import { calcularEnvio, calcularTotal } from '@/lib/envio';
import { DEPARTAMENTOS } from '@/lib/colombia';
import type { MetodoPago } from '@/lib/payments';
import { crearPedido } from '@/app/actions/publicas';
import { mensajePedido, whatsappUrl } from '@/lib/whatsapp';
import { trackEvento } from '@/lib/analytics';

type Confirmado = { numero: string; total: number; items: { nombre: string; cantidad: number; precio: number }[] };

export function CheckoutForm({ metodos }: { metodos: MetodoPago[] }) {
  const { items, hidratado, subtotal, vaciar } = useCarrito();
  const config = useConfig();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [confirmado, setConfirmado] = useState<Confirmado | null>(null);
  const [metodo, setMetodo] = useState(metodos[0]?.clave ?? 'whatsapp');

  // Misma función que usa el servidor al grabar el pedido (src/lib/envio.ts),
  // para que el total mostrado y el total guardado nunca difieran.
  const envio = calcularEnvio(subtotal, { costo: config.envioCosto, gratisDesde: config.envioGratisDesde });
  const costoEnvio = envio.costo;
  const total = calcularTotal(subtotal, 0, costoEnvio);

  /* ── Pantalla de confirmación ─────────────────────────────────── */
  if (confirmado) {
    const enlace = whatsappUrl(
      config.whatsapp,
      mensajePedido(confirmado.items, confirmado.total, confirmado.numero),
    );
    return (
      <div
        role="status"
        tabIndex={-1}
        ref={(nodo) => nodo?.focus()}
        className="mx-auto max-w-xl border border-[var(--surface-line)] p-8 text-center outline-none"
      >
        <span className="mx-auto block size-2 rotate-45 bg-champagne" aria-hidden="true" />
        <h2 className="display-md mt-6">Pedido registrado</h2>
        <p className="mt-3 text-[0.9rem] text-[var(--surface-muted)]">
          Guarda tu número de pedido. Con él y tu teléfono puedes consultar el estado cuando quieras.
        </p>
        <p className="mt-6 border border-[var(--surface-line)] py-4 font-[family-name:var(--font-display)] text-2xl tracking-wide">
          {confirmado.numero}
        </p>
        <p className="mt-4 text-[0.9rem]">
          Total: <span className="text-champagne">{formatCOP(confirmado.total)}</span>
        </p>
        <p className="mt-4 text-[0.85rem] leading-relaxed text-[var(--surface-muted)]">
          Nos comunicamos contigo para confirmar disponibilidad, forma de pago y envío. Todavía no
          se ha realizado ningún cobro.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {enlace && (
            <ExternalButton href={enlace} target="_blank" tamano="lg">
              Confirmar por WhatsApp
            </ExternalButton>
          )}
          <ButtonLink href="/pedido" variante="contorno">
            Consultar mi pedido
          </ButtonLink>
          <Link
            href="/perfumes"
            className="text-[0.68rem] uppercase tracking-[0.16em] text-[var(--surface-muted)] underline-offset-4 hover:text-champagne hover:underline"
          >
            Seguir explorando
          </Link>
        </div>
      </div>
    );
  }

  if (!hidratado) {
    return <div className="h-72 animate-pulse border border-[var(--surface-line)]" aria-hidden="true" />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        titulo="No hay nada para pagar"
        texto="Agrega al menos una fragancia con precio publicado para continuar."
      >
        <ButtonLink href="/perfumes">Ver catálogo</ButtonLink>
      </EmptyState>
    );
  }

  const enviar = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setError('');
    setEnviando(true);

    const datos = Object.fromEntries(new FormData(evento.currentTarget)) as Record<string, string>;
    const resultado = await crearPedido({
      ...datos,
      metodoPago: metodo,
      items: items.map((item) => ({ id: item.id, cantidad: item.cantidad })),
    });

    setEnviando(false);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }

    trackEvento('Purchase', {
      value: resultado.datos?.total ?? total,
      currency: 'COP',
      transaction_id: resultado.datos?.numero,
    });
    setConfirmado({
      numero: resultado.datos!.numero,
      total: resultado.datos!.total,
      items: items.map((item) => ({
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: item.precio,
      })),
    });
    vaciar();
  };

  return (
    <form onSubmit={enviar} className="grid gap-12 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-10">
        <section>
          <h2 className="eyebrow mb-5">Tus datos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo nombre="nombre" etiqueta="Nombre" requerido autoComplete="given-name" />
            <Campo nombre="apellido" etiqueta="Apellido" autoComplete="family-name" />
            <Campo
              nombre="telefono"
              etiqueta="Teléfono / WhatsApp"
              requerido
              tipo="tel"
              autoComplete="tel"
              inputMode="tel"
            />
            <Campo nombre="email" etiqueta="Correo (opcional)" tipo="email" autoComplete="email" />
          </div>
        </section>

        <section>
          <h2 className="eyebrow mb-5">Envío</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.2em] text-[var(--surface-muted)]">
                Departamento
              </span>
              <select
                name="departamento"
                defaultValue=""
                className="w-full border border-[var(--surface-control)] bg-[var(--surface-input)] px-4 py-3 text-sm outline-none transition-colors focus:border-champagne"
              >
                <option value="" className="bg-noir">
                  Selecciona…
                </option>
                {DEPARTAMENTOS.map((departamento) => (
                  <option key={departamento} value={departamento} className="bg-noir">
                    {departamento}
                  </option>
                ))}
              </select>
            </label>
            <Campo nombre="ciudad" etiqueta="Ciudad" autoComplete="address-level2" />
            <div className="sm:col-span-2">
              <Campo nombre="direccion" etiqueta="Dirección" autoComplete="street-address" />
            </div>
            <label className="sm:col-span-2">
              <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.2em] text-[var(--surface-muted)]">
                Información adicional (opcional)
              </span>
              <textarea
                name="notas"
                rows={3}
                maxLength={800}
                placeholder="Barrio, punto de referencia, horario para recibir…"
                className="w-full border border-[var(--surface-control)] bg-[var(--surface-input)] px-4 py-3 text-sm outline-none transition-colors placeholder:text-[var(--surface-muted)] focus:border-champagne"
              />
            </label>
          </div>
          {config.envioNota && (
            <p className="mt-4 text-[0.8rem] text-[var(--surface-muted)]">{config.envioNota}</p>
          )}
        </section>

        <section>
          <h2 className="eyebrow mb-5">Forma de pago</h2>
          <div className="space-y-3">
            {metodos.map((opcion) => (
              <label
                key={opcion.clave}
                className={`flex cursor-pointer gap-4 border p-4 transition-colors ${
                  metodo === opcion.clave
                    ? 'border-champagne'
                    : 'border-[var(--surface-line)] hover:border-champagne/50'
                } ${opcion.disponible ? '' : 'cursor-not-allowed opacity-50'}`}
              >
                <input
                  type="radio"
                  name="metodoPagoUI"
                  value={opcion.clave}
                  checked={metodo === opcion.clave}
                  disabled={!opcion.disponible}
                  onChange={() => setMetodo(opcion.clave)}
                  className="mt-1 accent-[var(--color-champagne)]"
                />
                <span>
                  <span className="block text-[0.9rem]">{opcion.etiqueta}</span>
                  <span className="mt-1 block text-[0.8rem] text-[var(--surface-muted)]">
                    {opcion.descripcion}
                  </span>
                  {opcion.nota && (
                    <span className="mt-1 block text-[0.72rem] uppercase tracking-[0.14em] text-champagne/70">
                      {opcion.nota}
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </section>
      </div>

      <aside className="h-fit border border-[var(--surface-line)] p-6 lg:sticky lg:top-28">
        <h2 className="eyebrow mb-5">Tu pedido</h2>
        <ul className="max-h-72 space-y-4 overflow-y-auto pr-1 scroll-row">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3">
              <span className="relative size-14 shrink-0 overflow-hidden bg-noir">
                {item.imagen ? (
                  <Image src={item.imagen} alt="" fill sizes="56px" className="object-cover" />
                ) : (
                  <ProductPlaceholder codigo={item.codigo} compacto className="size-full" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.85rem]">{item.nombre}</span>
                <span className="block text-[0.72rem] text-[var(--surface-muted)]">
                  {item.cantidad} × {formatCOP(item.precio)}
                </span>
              </span>
              <span className="text-[0.82rem]">{formatCOP(item.precio * item.cantidad)}</span>
            </li>
          ))}
        </ul>

        <label className="mt-6 block">
          <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.2em] text-[var(--surface-muted)]">
            Cupón (opcional)
          </span>
          <input
            name="cupon"
            maxLength={40}
            className="w-full border border-[var(--surface-control)] bg-[var(--surface-input)] px-4 py-2.5 text-sm uppercase outline-none transition-colors focus:border-champagne"
          />
        </label>

        <dl className="mt-6 space-y-3 border-t border-[var(--surface-line)] pt-5 text-[0.9rem]">
          <div className="flex justify-between">
            <dt className="text-[var(--surface-muted)]">Subtotal</dt>
            <dd>{formatCOP(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--surface-muted)]">Envío</dt>
            <dd>
              {costoEnvio == null ? 'Se coordina contigo' : costoEnvio === 0 ? 'Gratis' : formatCOP(costoEnvio)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-[var(--surface-line)] pt-3">
            <dt className="text-[0.7rem] uppercase tracking-[0.2em]">Total</dt>
            <dd className="font-[family-name:var(--font-display)] text-xl">{formatCOP(total)}</dd>
          </div>
        </dl>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-300">
            {error}
          </p>
        )}

        <Button type="submit" tamano="lg" className="mt-6 w-full" disabled={enviando}>
          {enviando ? 'Registrando…' : 'Confirmar pedido'}
        </Button>

        <p className="mt-4 text-[0.75rem] leading-relaxed text-[var(--surface-muted)]">
          Al confirmar registramos tu pedido y nos comunicamos contigo. El cobro se acuerda en ese
          momento: desde aquí no se realiza ningún pago.
        </p>
      </aside>
    </form>
  );
}

function Campo({
  nombre,
  etiqueta,
  tipo = 'text',
  requerido = false,
  autoComplete,
  inputMode,
}: {
  nombre: string;
  etiqueta: string;
  tipo?: string;
  requerido?: boolean;
  autoComplete?: string;
  inputMode?: 'tel' | 'text' | 'email';
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.2em] text-[var(--surface-muted)]">
        {etiqueta}
        {requerido && <span className="text-champagne"> *</span>}
      </span>
      <input
        name={nombre}
        type={tipo}
        required={requerido}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className="w-full border border-[var(--surface-control)] bg-[var(--surface-input)] px-4 py-3 text-sm outline-none transition-colors focus:border-champagne"
      />
    </label>
  );
}
