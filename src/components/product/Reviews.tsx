'use client';

import { useActionState, useId, useState } from 'react';
import { enviarResena } from '@/app/actions/publicas';
import { Button } from '@/components/ui/Button';
import { Stars } from '@/components/ui/Bits';
import { formatFecha } from '@/lib/format';
import type { Review } from '@/db/schema';

const promedio = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/**
 * Opiniones compactas. Sin opiniones es una sola línea discreta; con ellas,
 * un resumen a la izquierda y la lista separada por hilos a la derecha,
 * alineada con la columna de información de la ficha.
 * Toda opinión pasa por moderación en /admin antes de publicarse.
 */
export function Reviews({
  productId,
  resenas,
  rating,
  total,
}: {
  productId: number;
  resenas: Review[];
  rating: number | null;
  total: number;
}) {
  const [estado, accion, pendiente] = useActionState(enviarResena, null);
  const [puntuacion, setPuntuacion] = useState(5);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const idTitulo = useId();
  const idFormulario = useId();
  const conResenas = total > 0 && resenas.length > 0;

  const alternar = (
    <button
      type="button"
      onClick={() => setFormularioAbierto((abierto) => !abierto)}
      aria-expanded={formularioAbierto}
      aria-controls={idFormulario}
      className="link-flecha shrink-0"
    >
      {formularioAbierto ? (estado?.ok ? 'Cerrar' : 'Cancelar') : 'Escribir una opinión'}
    </button>
  );

  return (
    <section
      id="opiniones"
      aria-labelledby={idTitulo}
      data-reveal
      className={`scroll-mt-[calc(var(--header-h)_+_2rem)] border-t border-[var(--surface-line)] ${
        conResenas ? 'py-12 lg:py-16' : 'py-7 lg:py-9'
      }`}
    >
      <div className="md:mx-auto md:max-w-[34rem] lg:mx-0 lg:grid lg:max-w-none lg:grid-cols-12 lg:gap-x-10 xl:gap-x-16">
        <div className="lg:col-span-7">
          <h2
            id={idTitulo}
            className={`eyebrow font-[family-name:var(--font-sans)] leading-normal ${
              conResenas ? '' : 'lg:flex lg:min-h-11 lg:items-center'
            }`}
          >
            Opiniones
          </h2>

          {conResenas && (
            <>
              {rating != null && (
                <div className="mt-6 flex items-end gap-5">
                  <p className="font-[family-name:var(--font-display)] text-[3.5rem] leading-[0.9] tabular-nums">
                    {promedio.format(rating)}
                    <span className="sr-only"> de 5</span>
                  </p>
                  <div className="pb-1">
                    <Stars valor={rating} size={14} etiquetado={false} className="text-[var(--acento)]" />
                    <p className="mt-1.5 text-[0.875rem] text-[var(--surface-muted)]">
                      {total} {total === 1 ? 'opinión' : 'opiniones'}
                    </p>
                  </div>
                </div>
              )}
              <div className="mt-6">{alternar}</div>
            </>
          )}
        </div>

        <div className="min-w-0 lg:col-span-5 lg:col-start-8 lg:pl-6 xl:pl-12">
          {!conResenas && (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-x-6 lg:mt-0">
              <p className="py-2 text-base text-[var(--surface-muted)]">
                Aún no hay opiniones de esta fragancia.
              </p>
              {alternar}
            </div>
          )}

          <div
            id={idFormulario}
            hidden={!formularioAbierto}
            className={`@container border border-[var(--surface-line)] p-5 sm:p-7 ${
              conResenas ? 'mt-8 lg:mb-8 lg:mt-0' : 'mt-4'
            }`}
          >
            {estado?.ok ? (
              <p
                role="status"
                tabIndex={-1}
                ref={(nodo) => nodo?.focus()}
                className="text-base text-[var(--surface-fg)] outline-none"
              >
                ¡Gracias! Tu opinión quedó registrada y se publicará después de revisarla.
              </p>
            ) : (
              <form action={accion} className="grid gap-5 @md:grid-cols-2">
                <input type="hidden" name="productId" value={productId} />
                <input type="hidden" name="rating" value={puntuacion} />

                <fieldset className="@md:col-span-2">
                  <legend className="mb-1 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[var(--surface-muted)]">
                    Tu puntuación
                  </legend>
                  <div className="-ml-2.5 flex">
                    {[1, 2, 3, 4, 5].map((valor) => (
                      <button
                        key={valor}
                        type="button"
                        onClick={() => setPuntuacion(valor)}
                        aria-label={`${valor} de 5 estrellas`}
                        aria-pressed={puntuacion === valor}
                        className={`flex size-11 items-center justify-center transition-colors duration-300 ${
                          valor <= puntuacion ? 'text-[var(--acento)]' : 'text-[var(--surface-muted)]'
                        }`}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill={valor <= puntuacion ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          strokeWidth="1.2"
                          aria-hidden="true"
                        >
                          <path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </fieldset>

                <Campo nombre="nombre" etiqueta="Tu nombre" requerido autoComplete="name" />
                <Campo nombre="email" etiqueta="Correo (opcional)" tipo="email" autoComplete="email" />

                <label className="@md:col-span-2">
                  <span className="mb-2 block text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[var(--surface-muted)]">
                    Tu opinión
                  </span>
                  <textarea
                    name="comentario"
                    required
                    minLength={10}
                    maxLength={1200}
                    rows={4}
                    className="w-full border border-[var(--surface-control)] bg-[var(--surface-input)] px-4 py-3 text-base transition-colors duration-300 focus:border-[var(--foco)]"
                  />
                </label>

                {estado && !estado.ok && (
                  <p role="alert" className="text-[0.9375rem] text-[var(--acento)] @md:col-span-2">
                    {estado.error}
                  </p>
                )}

                <div className="@md:col-span-2">
                  <Button type="submit" disabled={pendiente} className="w-full @md:w-auto">
                    {pendiente ? 'Enviando…' : 'Enviar opinión'}
                  </Button>
                  <p className="mt-3 text-[0.875rem] text-[var(--surface-muted)]">
                    Las opiniones se publican después de ser revisadas por el equipo de YLANE.
                  </p>
                </div>
              </form>
            )}
          </div>

          {conResenas && (
            <ul className="mt-8 border-t border-[var(--surface-line)] lg:mt-0">
              {resenas.map((resena) => (
                <li key={resena.id} className="border-b border-[var(--surface-line)] py-6">
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <p className="text-[0.9375rem] font-medium">{resena.nombre}</p>
                    <Stars valor={resena.rating} className="text-[var(--acento)]" />
                  </div>
                  <p className="mt-1 text-[0.6875rem] uppercase tracking-[0.16em] text-[var(--surface-muted)]">
                    {/* La fecha se formatea con la zona horaria de quien la pinta: servidor y navegador pueden diferir un día. */}
                    <time dateTime={resena.createdAt} suppressHydrationWarning>
                      {formatFecha(resena.createdAt)}
                    </time>
                  </p>
                  {resena.titulo && (
                    <p className="mt-4 font-[family-name:var(--font-display)] text-[1.2rem] leading-snug">
                      {resena.titulo}
                    </p>
                  )}
                  <p className="mt-3 text-base leading-relaxed text-[var(--surface-muted)]">
                    {resena.comentario}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function Campo({
  nombre,
  etiqueta,
  tipo = 'text',
  requerido = false,
  autoComplete,
}: {
  nombre: string;
  etiqueta: string;
  tipo?: string;
  requerido?: boolean;
  autoComplete?: string;
}) {
  return (
    <label>
      <span className="mb-2 block text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[var(--surface-muted)]">
        {etiqueta}
      </span>
      <input
        name={nombre}
        type={tipo}
        required={requerido}
        autoComplete={autoComplete}
        className="min-h-12 w-full border border-[var(--surface-control)] bg-[var(--surface-input)] px-4 py-3 text-base transition-colors duration-300 focus:border-[var(--foco)]"
      />
    </label>
  );
}
