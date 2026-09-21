'use client';

import { useEffect, useRef, useState, type FocusEvent, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { useCarrito } from '@/components/cart/CartProvider';
import { Miniatura } from '@/components/cart/LineaCarrito';
import { ResumenImportes } from '@/components/cart/ResumenImportes';
import { SeleccionVacia } from '@/components/cart/SeleccionVacia';
import { useConfig } from '@/components/ConfigProvider';
import { CLASE_CAMPO, CLASE_ETIQUETA, CLASE_GRUPO } from '@/components/forms/Campo';
import { Indice } from '@/components/ui/Bits';
import { Button, ButtonLink, ExternalButton } from '@/components/ui/Button';
import { formatCOP, nombreSinMarca } from '@/lib/format';
import { calcularEnvio, calcularTotal } from '@/lib/envio';
import { DEPARTAMENTOS } from '@/lib/colombia';
import type { MetodoPago } from '@/lib/payments';
import { crearPedido, type PedidoCreado, type Resultado } from '@/app/actions/publicas';
import { mensajePedido, whatsappUrl } from '@/lib/whatsapp';
import { trackEvento } from '@/lib/analytics';

type Confirmado = { numero: string; total: number; items: { nombre: string; cantidad: number; precio: number }[] };

/* Campos que se revisan en el navegador antes de llamar al servidor. */
const CAMPOS = ['nombre', 'telefono', 'email', 'cupon'] as const;
type CampoRevisado = (typeof CAMPOS)[number];
type Errores = Partial<Record<CampoRevisado, string>>;

const ETIQUETAS: Record<CampoRevisado, string> = {
  nombre: 'Nombre',
  telefono: 'Teléfono / WhatsApp',
  email: 'Correo',
  cupon: 'Cupón',
};

const esCampoRevisado = (nombre: string): nombre is CampoRevisado =>
  (CAMPOS as readonly string[]).includes(nombre);

const idCampo = (nombre: string) => `checkout-${nombre}`;

/** El control que originó un evento delegado en el formulario, si es un campo. */
function controlDe(objetivo: EventTarget): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null {
  return objetivo instanceof HTMLInputElement ||
    objetivo instanceof HTMLSelectElement ||
    objetivo instanceof HTMLTextAreaElement
    ? objetivo
    : null;
}

/**
 * Las reglas del esquema de `crearPedido` (app/actions/publicas.ts), para
 * avisar junto al campo antes de enviar. El servidor sigue validando igual:
 * esto sólo adelanta el aviso. El cupón únicamente lo puede comprobar él.
 */
function revisar(campo: CampoRevisado, valor: string): string | undefined {
  const limpio = valor.trim();
  switch (campo) {
    case 'nombre':
      return limpio ? undefined : 'Escribe tu nombre para registrar el pedido.';
    case 'telefono':
      if (!limpio) return 'Escribe un teléfono o WhatsApp para confirmar el pedido contigo.';
      if (!/^[\d+\s()-]+$/.test(limpio)) {
        return 'Usa sólo números; puedes incluir +, espacios, guiones o paréntesis.';
      }
      if (limpio.length < 7) return 'El teléfono parece incompleto.';
      if (limpio.length > 20) return 'El teléfono tiene demasiados caracteres.';
      return undefined;
    case 'email':
      if (!limpio) return undefined;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio)
        ? undefined
        : 'Revisa el correo: debe tener la forma nombre@dominio.com.';
    default:
      return undefined;
  }
}

/** El servidor devuelve sólo un mensaje: además del resumen, se muestra junto al campo que nombra. */
function campoDelMensaje(mensaje: string): CampoRevisado | null {
  if (/cup[oó]n/i.test(mensaje)) return 'cupon';
  if (/tel[eé]fono/i.test(mensaje)) return 'telefono';
  if (/correo/i.test(mensaje)) return 'email';
  return null;
}

export function CheckoutForm({ metodos }: { metodos: MetodoPago[] }) {
  const { items, hidratado, subtotal, vaciar } = useCarrito();
  const config = useConfig();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [errores, setErrores] = useState<Errores>({});
  const [intentado, setIntentado] = useState(false);
  const [confirmado, setConfirmado] = useState<Confirmado | null>(null);
  const [metodo, setMetodo] = useState(metodos[0]?.clave ?? 'whatsapp');
  const alerta = useRef<HTMLDivElement>(null);
  const confirmacion = useRef<HTMLDivElement>(null);

  // La confirmación toma el foco una sola vez, al aparecer.
  useEffect(() => {
    if (confirmado) confirmacion.current?.focus();
  }, [confirmado]);

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
        ref={confirmacion}
        role="status"
        tabIndex={-1}
        className="scroll-mt-[calc(var(--header-h)+2rem)] pb-24 outline-none lg:pb-32"
      >
        <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-12">
          <header className="lg:col-span-7">
            <Indice>Gracias</Indice>
            <h1 className="display-lg mt-5">Pedido registrado</h1>
            <p className="lead mt-6">
              Guarda tu número de pedido. Con él y tu teléfono puedes consultar el estado cuando quieras.
            </p>
          </header>

          {/* El número, como un comprobante: es lo único que hay que guardar. */}
          <div
            data-surface="lino"
            className="p-7 sm:p-10 lg:col-span-5 lg:row-span-2 lg:self-start xl:col-span-4 xl:col-start-9"
          >
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-[var(--surface-muted)]">
              Número de pedido
            </p>
            <p className="mt-4 select-all font-[family-name:var(--font-display)] text-[1.75rem] leading-none tracking-[0.04em] sm:text-[2.25rem]">
              {confirmado.numero}
            </p>
            <dl className="mt-8 flex items-baseline justify-between gap-4 border-t-[3px] border-double border-[var(--surface-control)] pt-5">
              <dt className="text-[0.6875rem] font-medium uppercase tracking-[0.24em]">Total</dt>
              <dd className="font-[family-name:var(--font-display)] text-[1.75rem] leading-none tabular-nums">
                {formatCOP(confirmado.total)}
              </dd>
            </dl>
          </div>

          <div className="lg:col-span-7">
            <p className="max-w-[34rem] text-base leading-relaxed text-[var(--surface-muted)] lg:text-[0.9375rem]">
              Nos comunicamos contigo para confirmar disponibilidad, forma de pago y envío. Todavía no se ha
              realizado ningún cobro.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {enlace && (
                <ExternalButton href={enlace} target="_blank" tamano="lg">
                  Confirmar por WhatsApp
                  <span className="sr-only"> (se abre en una pestaña nueva)</span>
                </ExternalButton>
              )}
              <ButtonLink href="/pedido" variante={enlace ? 'contorno' : 'principal'} tamano="lg">
                Consultar mi pedido
              </ButtonLink>
            </div>
            <div className="mt-6">
              <Link href="/perfumes" className="link-flecha group">
                Seguir explorando
                <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hidratado) {
    return (
      <>
        <Encabezado />
        <Esqueleto />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Encabezado />
        <div className="mt-10 border-t border-[var(--surface-control)] pb-24 pt-10 lg:mt-14 lg:pb-32 lg:pt-14">
          <SeleccionVacia
            titulo="No hay nada para pagar"
            texto="Agrega al menos una fragancia con precio publicado para continuar."
          />
        </div>
      </>
    );
  }

  const enfocarCampo = (campo: CampoRevisado) => document.getElementById(idCampo(campo))?.focus();

  const fijarError = (campo: CampoRevisado, mensaje: string | undefined) =>
    setErrores((previos) => {
      if (previos[campo] === mensaje) return previos;
      const siguientes = { ...previos };
      if (mensaje) siguientes[campo] = mensaje;
      else delete siguientes[campo];
      return siguientes;
    });

  // Se revisa al salir del campo, no mientras se escribe. Un campo vacío sólo
  // se señala después del primer intento de envío.
  const alSalir = (evento: FocusEvent<HTMLFormElement>) => {
    const campo = controlDe(evento.target);
    if (!campo) return;
    const { name, value } = campo;
    if (!esCampoRevisado(name) || name === 'cupon') return;
    fijarError(name, !value.trim() && !intentado ? undefined : revisar(name, value));
  };

  // Mientras se escribe sólo se retiran avisos: el error se va en cuanto el
  // dato queda bien, pero no aparece uno nuevo a medio escribir.
  const alEscribir = (evento: FormEvent<HTMLFormElement>) => {
    const campo = controlDe(evento.target);
    if (!campo) return;
    const { name, value } = campo;
    if (!esCampoRevisado(name) || !errores[name]) return;
    if (name === 'cupon' || !revisar(name, value)) {
      fijarError(name, undefined);
      // El mensaje del servidor que señalaba este campo también queda resuelto.
      if (error && campoDelMensaje(error) === name) setError('');
    }
  };

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setError('');
    const datos = Object.fromEntries(new FormData(evento.currentTarget)) as Record<string, string>;

    // Primero en el navegador, con las reglas del servidor: el aviso aparece
    // junto a cada campo y el foco va al primero que falta.
    setIntentado(true);
    const encontrados: Errores = {};
    for (const campo of CAMPOS) {
      const mensaje = revisar(campo, datos[campo] ?? '');
      if (mensaje) encontrados[campo] = mensaje;
    }
    setErrores(encontrados);
    const primero = CAMPOS.find((campo) => encontrados[campo]);
    if (primero) {
      window.requestAnimationFrame(() => enfocarCampo(primero));
      return;
    }

    setEnviando(true);
    let resultado: Resultado<PedidoCreado>;
    try {
      resultado = await crearPedido({
        ...datos,
        metodoPago: metodo,
        items: items.map((item) => ({ id: item.id, cantidad: item.cantidad })),
      });
    } catch {
      // Sin conexión o con el servidor caído, el botón no puede quedarse bloqueado.
      resultado = { ok: false, error: 'No pudimos registrar el pedido. Inténtalo de nuevo.' };
    }
    setEnviando(false);

    if (!resultado.ok) {
      setError(resultado.error);
      const campo = campoDelMensaje(resultado.error);
      if (campo) {
        const delServidor: Errores = {};
        delServidor[campo] = resultado.error;
        setErrores(delServidor);
      }
      window.requestAnimationFrame(() => (campo ? enfocarCampo(campo) : alerta.current?.focus()));
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

  // El resumen sólo aparece tras intentar enviar: antes, los avisos al salir
  // de un campo se quedan junto a él y no interrumpen al lector de pantalla.
  const pendientes = intentado ? CAMPOS.filter((campo) => errores[campo]) : [];
  const campoDelError = error ? campoDelMensaje(error) : null;
  // Con más de tres referencias la lista se desplaza dentro del resumen fijo.
  const listaLarga = items.length > 3;

  return (
    <>
      <Encabezado />

      <form
        noValidate
        onSubmit={enviar}
        onBlur={alSalir}
        onChange={alEscribir}
        className="mt-10 grid gap-y-14 lg:mt-14 lg:grid-cols-12 lg:gap-x-8 lg:pb-32"
      >
        <div className="lg:col-span-7">
          <Seccion id="checkout-datos" numero="01" titulo="Tus datos" texto="Los campos marcados con * son obligatorios.">
            <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
              <Campo
                nombre="nombre"
                etiqueta="Nombre"
                requerido
                autoComplete="given-name"
                maxLength={120}
                error={errores.nombre}
              />
              <Campo nombre="apellido" etiqueta="Apellido" autoComplete="family-name" maxLength={120} />
              <Campo
                nombre="telefono"
                etiqueta="Teléfono / WhatsApp"
                requerido
                tipo="tel"
                autoComplete="tel"
                inputMode="tel"
                maxLength={20}
                error={errores.telefono}
              />
              <Campo
                nombre="email"
                etiqueta="Correo"
                opcional
                tipo="email"
                autoComplete="email"
                maxLength={160}
                error={errores.email}
              />
            </div>
          </Seccion>

          <Seccion id="checkout-entrega" numero="02" titulo="Entrega" texto={config.envioNota || undefined}>
            <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
              <Selector
                nombre="departamento"
                etiqueta="Departamento"
                opciones={DEPARTAMENTOS}
                autoComplete="address-level1"
              />
              <Campo nombre="ciudad" etiqueta="Ciudad" autoComplete="address-level2" maxLength={80} />
              <Campo
                nombre="direccion"
                etiqueta="Dirección"
                autoComplete="street-address"
                maxLength={200}
                className="sm:col-span-2"
              />
              <AreaTexto
                nombre="notas"
                etiqueta="Información adicional"
                opcional
                maxLength={800}
                placeholder="Barrio, punto de referencia, horario para recibir…"
                className="sm:col-span-2"
              />
            </div>
          </Seccion>

          <Seccion id="checkout-pago" numero="03" titulo="Forma de pago">
            <div role="radiogroup" aria-labelledby="checkout-pago" className="space-y-3">
              {metodos.map((opcion) => {
                const elegido = metodo === opcion.clave;
                return (
                  <label
                    key={opcion.clave}
                    className={`flex gap-4 border p-5 transition-[border-color,box-shadow,background-color] duration-300 ease-[var(--ease-silk)] ${
                      !opcion.disponible
                        ? 'cursor-not-allowed border-dashed border-[var(--surface-control)]'
                        : elegido
                          ? 'cursor-pointer border-[var(--acento)] bg-[var(--surface-input)] shadow-[inset_0_0_0_1px_var(--acento)]'
                          : 'cursor-pointer border-[var(--surface-control)] hover:border-[var(--surface-fg)]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="metodoPagoUI"
                      value={opcion.clave}
                      checked={elegido}
                      disabled={!opcion.disponible}
                      onChange={() => setMetodo(opcion.clave)}
                      className="mt-0.5 size-5 shrink-0 cursor-pointer appearance-none rounded-full border border-[var(--surface-control)] bg-[var(--surface-bg)] transition-[border-width,border-color] duration-200 checked:border-[6px] checked:border-[var(--acento)] disabled:cursor-not-allowed disabled:border-dashed"
                    />
                    <span className="min-w-0">
                      <span
                        className={`block text-base leading-snug ${
                          opcion.disponible ? '' : 'text-[var(--surface-muted)]'
                        }`}
                      >
                        {opcion.etiqueta}
                      </span>
                      <span className="mt-1 block text-[0.875rem] leading-relaxed text-[var(--surface-muted)]">
                        {opcion.descripcion}
                      </span>
                      {opcion.nota && (
                        <span className="mt-2 block text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[var(--surface-muted)]">
                          {opcion.nota}
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          </Seccion>
        </div>

        {/* Resumen: documento fijo al desplazar en escritorio; en móvil, una
            banda lino a todo el ancho que cierra la página. */}
        <aside
          aria-labelledby="checkout-resumen"
          data-surface="lino"
          className="px-5 py-10 max-md:-mx-5 md:px-10 md:max-lg:-mx-10 lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:col-span-5 lg:self-start lg:p-10 xl:col-span-4 xl:col-start-9"
        >
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="checkout-resumen" className="text-[1.75rem] leading-none">
              Tu pedido
            </h2>
            <Link href="/carrito" aria-label="Editar tu selección" className="link-flecha">
              Editar
            </Link>
          </div>

          <ul
            aria-label="Productos del pedido"
            tabIndex={listaLarga ? 0 : undefined}
            className={`mt-5 divide-y divide-[var(--surface-line)] border-t border-[var(--surface-control)] ${
              listaLarga ? 'lg:max-h-[19.5rem] lg:overflow-y-auto lg:overscroll-contain' : ''
            }`}
          >
            {items.map((item) => (
              <li key={item.id} className="flex gap-4 py-4">
                <Miniatura producto={item} sizes="56px" className="w-14" />
                <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                  <div className="min-w-0">
                    {item.marca && (
                      <p className="text-[0.625rem] font-medium uppercase tracking-[0.24em] text-[var(--surface-muted)]">
                        {item.marca}
                      </p>
                    )}
                    <p className="mt-0.5 text-[0.9375rem] leading-snug">{nombreSinMarca(item.nombre, item.marca)}</p>
                    <p className="mt-0.5 text-[0.8125rem] tabular-nums text-[var(--surface-muted)]">
                      {item.cantidad} × {formatCOP(item.precio)}
                    </p>
                  </div>
                  <p className="shrink-0 text-[0.9375rem] tabular-nums">{formatCOP(item.precio * item.cantidad)}</p>
                </div>
              </li>
            ))}
          </ul>

          <Campo
            nombre="cupon"
            etiqueta="Cupón"
            opcional
            maxLength={40}
            autoComplete="off"
            mayusculas
            ayuda="Se valida y se aplica al confirmar el pedido."
            error={errores.cupon}
            className="mt-6"
          />

          <ResumenImportes className="mt-8" subtotal={subtotal} costoEnvio={costoEnvio} total={total} />

          {/* Resumen de errores junto al botón: cada aviso lleva a su campo. */}
          <div ref={alerta} role="alert" tabIndex={-1} className="outline-none">
            {(error || pendientes.length > 0) && (
              <div className="mt-7 flex items-start gap-3 border-t border-[var(--surface-line)] pt-5 text-[0.9375rem] leading-snug">
                <IconoAviso className="mt-px size-[1.125rem] text-[var(--acento)]" />
                <div className="min-w-0">
                  <p className="font-medium">{error ? 'No pudimos registrar el pedido' : 'Revisa estos datos'}</p>
                  {error ? (
                    campoDelError ? (
                      <a
                        href={`#${idCampo(campoDelError)}`}
                        onClick={(evento) => {
                          evento.preventDefault();
                          enfocarCampo(campoDelError);
                        }}
                        className={ENLACE_AVISO}
                      >
                        {error}
                      </a>
                    ) : (
                      <p className="mt-1.5 leading-relaxed">{error}</p>
                    )
                  ) : (
                    <ul className="mt-1">
                      {pendientes.map((campo) => (
                        <li key={campo}>
                          <a
                            href={`#${idCampo(campo)}`}
                            onClick={(evento) => {
                              evento.preventDefault();
                              enfocarCampo(campo);
                            }}
                            className={ENLACE_AVISO}
                          >
                            {ETIQUETAS[campo]}: {errores[campo]}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

          <Button type="submit" tamano="lg" className="mt-8 w-full" disabled={enviando}>
            {enviando ? 'Registrando…' : 'Confirmar pedido'}
          </Button>

          <p className="mt-5 text-[0.8125rem] leading-relaxed text-[var(--surface-muted)]">
            Al confirmar registramos tu pedido y nos comunicamos contigo. El cobro se acuerda en ese
            momento: desde aquí no se realiza ningún pago.
          </p>
        </aside>
      </form>
    </>
  );
}

/* ── Piezas de la página ─────────────────────────────────────────── */

function Encabezado() {
  return (
    <header className="max-w-3xl">
      <Indice>Último paso</Indice>
      <h1 className="display-lg mt-5">Finalizar compra</h1>
    </header>
  );
}

/** Sección numerada: el número vive en el margen en escritorio y encima del título en móvil. */
function Seccion({
  id,
  numero,
  titulo,
  texto,
  children,
}: {
  id: string;
  numero: string;
  titulo: string;
  texto?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="border-t border-[var(--surface-control)] pb-14 pt-7 last:pb-0 lg:grid lg:grid-cols-[5.5rem_minmax(0,1fr)] lg:pb-16 lg:pt-9 lg:last:pb-0"
    >
      <p
        aria-hidden="true"
        className="font-[family-name:var(--font-display)] text-[1.125rem] leading-none tabular-nums text-[var(--acento)] lg:text-[2rem]"
      >
        {numero}
      </p>
      <div className="mt-3 lg:mt-0">
        <h2 id={id} className="text-[1.75rem] leading-[1.1] lg:text-[2rem]">
          {titulo}
        </h2>
        {texto && (
          <p className="mt-2 max-w-[34rem] text-base leading-relaxed text-[var(--surface-muted)] lg:text-[0.9375rem]">
            {texto}
          </p>
        )}
        <div className="mt-7">{children}</div>
      </div>
    </section>
  );
}

/** Mientras se lee el carrito guardado: la misma composición, sin contenido. */
function Esqueleto() {
  return (
    <div aria-hidden="true" className="mt-10 grid gap-y-14 pb-24 lg:mt-14 lg:grid-cols-12 lg:gap-x-8 lg:pb-32">
      <div className="lg:col-span-7">
        {['01', '02'].map((numero) => (
          <div key={numero} className="border-t border-[var(--surface-control)] pb-14 pt-7 lg:pb-16 lg:pt-9">
            <div className="h-7 w-44 animate-pulse bg-[var(--surface-line)]" />
            <div className="mt-8 grid gap-x-5 gap-y-6 sm:grid-cols-2">
              {[0, 1, 2, 3].map((campo) => (
                <div key={campo} className="h-12 animate-pulse border border-[var(--surface-line)]" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div
        data-surface="lino"
        className="h-[28rem] animate-pulse max-md:-mx-5 md:max-lg:-mx-10 lg:col-span-5 xl:col-span-4 xl:col-start-9"
      />
    </div>
  );
}

/* ── Campos ──────────────────────────────────────────────────────── */

/**
 * El campo común de los formularios públicos (components/forms/Campo: 48 px,
 * texto de 16 px, línea inferior) más lo que el checkout necesita: estado de
 * error y un margen al enfocarlo para que la cabecera fija no tape la etiqueta.
 */
const CONTROL = `${CLASE_CAMPO} scroll-mt-[calc(var(--header-h)+6rem)] aria-[invalid=true]:border-[var(--acento)] aria-[invalid=true]:shadow-[inset_0_-1px_0_var(--acento)]`;

const ENLACE_AVISO =
  'inline-flex min-h-11 items-center underline decoration-[color:var(--surface-line)] underline-offset-4 transition-colors duration-300 hover:text-[var(--acento)] hover:decoration-current';

type PropsControl = {
  nombre: string;
  etiqueta: string;
  requerido?: boolean;
  opcional?: boolean;
  error?: string;
  ayuda?: string;
  className?: string;
};

/** Ids de lo que describe al control: el error y la ayuda, si existen. */
function descritoPor(id: string, error?: string, ayuda?: string): string | undefined {
  const ids = [error ? `${id}-error` : '', ayuda ? `${id}-ayuda` : ''].filter(Boolean).join(' ');
  return ids || undefined;
}

function Campo({
  nombre,
  etiqueta,
  requerido = false,
  opcional = false,
  error,
  ayuda,
  className = '',
  tipo = 'text',
  autoComplete,
  inputMode,
  maxLength,
  mayusculas = false,
}: PropsControl & {
  tipo?: 'text' | 'tel' | 'email';
  autoComplete?: string;
  inputMode?: 'tel' | 'text' | 'email';
  maxLength?: number;
  mayusculas?: boolean;
}) {
  const id = idCampo(nombre);
  return (
    <div className={`${CLASE_GRUPO} ${className}`}>
      <Etiqueta htmlFor={id} texto={etiqueta} requerido={requerido} opcional={opcional} />
      <input
        id={id}
        name={nombre}
        type={tipo}
        required={requerido}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={descritoPor(id, error, ayuda)}
        className={`${CONTROL} ${mayusculas ? 'uppercase' : ''}`}
      />
      <Descripcion id={id} error={error} ayuda={ayuda} />
    </div>
  );
}

function Selector({
  nombre,
  etiqueta,
  opciones,
  autoComplete,
  className = '',
}: PropsControl & { opciones: readonly string[]; autoComplete?: string }) {
  const id = idCampo(nombre);
  return (
    <div className={`${CLASE_GRUPO} ${className}`}>
      <Etiqueta htmlFor={id} texto={etiqueta} />
      <div className="relative">
        <select
          id={id}
          name={nombre}
          defaultValue=""
          autoComplete={autoComplete}
          className={`${CONTROL} cursor-pointer appearance-none pr-11`}
        >
          <option value="">Selecciona…</option>
          {opciones.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}

function AreaTexto({
  nombre,
  etiqueta,
  opcional = false,
  placeholder,
  maxLength,
  className = '',
}: PropsControl & { placeholder?: string; maxLength?: number }) {
  const id = idCampo(nombre);
  return (
    <div className={`${CLASE_GRUPO} ${className}`}>
      <Etiqueta htmlFor={id} texto={etiqueta} opcional={opcional} />
      <textarea
        id={id}
        name={nombre}
        rows={3}
        maxLength={maxLength}
        placeholder={placeholder}
        className={`${CONTROL} resize-y`}
      />
    </div>
  );
}

function Etiqueta({
  htmlFor,
  texto,
  requerido = false,
  opcional = false,
}: {
  htmlFor: string;
  texto: string;
  requerido?: boolean;
  opcional?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="flex items-baseline justify-between gap-3">
      <span className={CLASE_ETIQUETA}>
        {texto}
        {/* El asterisco es visual: `required` ya lo anuncia al lector de pantalla. */}
        {requerido && (
          <span aria-hidden="true" className="ml-1 text-[var(--acento)]">
            *
          </span>
        )}
      </span>
      {opcional && <span className="mb-2.5 text-[0.75rem] text-[var(--surface-muted)]">Opcional</span>}
    </label>
  );
}

/** Error junto al campo (con icono: el color no es la única señal) y ayuda persistente. */
function Descripcion({ id, error, ayuda }: { id: string; error?: string; ayuda?: string }) {
  return (
    <>
      {error && (
        <p
          id={`${id}-error`}
          className="mt-2.5 flex items-start gap-2 text-[0.875rem] leading-snug text-[var(--acento)]"
        >
          <IconoAviso className="mt-[0.1em] size-[0.95rem]" />
          <span>{error}</span>
        </p>
      )}
      {ayuda && (
        <p id={`${id}-ayuda`} className="mt-2.5 text-[0.8125rem] leading-snug text-[var(--surface-muted)]">
          {ayuda}
        </p>
      )}
    </>
  );
}

/** Mismo trazo que el aviso de error de los formularios públicos (forms/Campo). */
function IconoAviso({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      className={`shrink-0 ${className}`}
    >
      <circle cx="10" cy="10" r="8.3" />
      <path d="M10 5.8v5.4M10 14.1v.1" />
    </svg>
  );
}
