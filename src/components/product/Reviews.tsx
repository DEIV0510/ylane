'use client';

import { useActionState, useState } from 'react';
import { enviarResena } from '@/app/actions/publicas';
import { Button } from '@/components/ui/Button';
import { Stars } from '@/components/ui/Bits';
import { formatFecha } from '@/lib/format';
import type { Review } from '@/db/schema';

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

  return (
    <section className="border-t border-[var(--surface-line)] pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">Opiniones</p>
          <h2 className="display-md">
            {total > 0 ? `${total} ${total === 1 ? 'reseña' : 'reseñas'}` : 'Sé el primero en opinar'}
          </h2>
          {rating != null && (
            <div className="mt-3 flex items-center gap-3">
              <Stars valor={rating} size={16} className="text-champagne" />
              <span className="text-sm text-[var(--surface-muted)]">{rating.toFixed(1)} de 5</span>
            </div>
          )}
        </div>
        <Button
          variante="contorno"
          tamano="sm"
          onClick={() => setFormularioAbierto((abierto) => !abierto)}
          aria-expanded={formularioAbierto}
        >
          {formularioAbierto ? 'Cancelar' : 'Escribir reseña'}
        </Button>
      </div>

      {formularioAbierto && (
        <div className="mt-8 border border-[var(--surface-line)] p-6">
          {estado?.ok ? (
            <p className="text-sm text-champagne">
              ¡Gracias! Tu reseña quedó registrada y se publicará después de revisarla.
            </p>
          ) : (
            <form action={accion} className="grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="productId" value={productId} />
              <input type="hidden" name="rating" value={puntuacion} />

              <div className="sm:col-span-2">
                <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.2em] text-[var(--surface-muted)]">
                  Tu puntuación
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((valor) => (
                    <button
                      key={valor}
                      type="button"
                      onClick={() => setPuntuacion(valor)}
                      aria-label={`${valor} de 5 estrellas`}
                      aria-pressed={puntuacion === valor}
                      className={`p-1 transition-colors ${
                        valor <= puntuacion ? 'text-champagne' : 'text-[var(--surface-muted)]'
                      }`}
                    >
                      <svg width="22" height="22" viewBox="0 0 20 20" fill={valor <= puntuacion ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.2">
                        <path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <Campo nombre="nombre" etiqueta="Tu nombre" requerido />
              <Campo nombre="email" etiqueta="Correo (opcional)" tipo="email" />

              <label className="sm:col-span-2">
                <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.2em] text-[var(--surface-muted)]">
                  Tu opinión
                </span>
                <textarea
                  name="comentario"
                  required
                  minLength={10}
                  maxLength={1200}
                  rows={4}
                  className="w-full border border-[var(--surface-line)] bg-[var(--surface-input)] px-4 py-3 text-sm outline-none transition-colors focus:border-champagne"
                />
              </label>

              {estado && !estado.ok && (
                <p className="text-sm text-red-300 sm:col-span-2">{estado.error}</p>
              )}

              <div className="sm:col-span-2">
                <Button type="submit" disabled={pendiente}>
                  {pendiente ? 'Enviando…' : 'Enviar reseña'}
                </Button>
                <p className="mt-3 text-[0.72rem] text-[var(--surface-muted)]">
                  Las reseñas se publican después de ser revisadas por el equipo de YLANE.
                </p>
              </div>
            </form>
          )}
        </div>
      )}

      {resenas.length > 0 && (
        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {resenas.map((resena) => (
            <li key={resena.id} className="border border-[var(--surface-line)] p-6">
              <div className="flex items-center justify-between gap-4">
                <span className="font-[family-name:var(--font-display)] text-lg">{resena.nombre}</span>
                <Stars valor={resena.rating} className="text-champagne" />
              </div>
              <p className="mt-1 text-[0.7rem] uppercase tracking-[0.16em] text-[var(--surface-muted)]">
                {formatFecha(resena.createdAt)}
              </p>
              <p className="mt-4 text-[0.9rem] leading-relaxed text-[var(--surface-muted)]">
                {resena.comentario}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Campo({
  nombre,
  etiqueta,
  tipo = 'text',
  requerido = false,
}: {
  nombre: string;
  etiqueta: string;
  tipo?: string;
  requerido?: boolean;
}) {
  return (
    <label>
      <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.2em] text-[var(--surface-muted)]">
        {etiqueta}
      </span>
      <input
        name={nombre}
        type={tipo}
        required={requerido}
        className="w-full border border-[var(--surface-line)] bg-[var(--surface-input)] px-4 py-3 text-sm outline-none transition-colors focus:border-champagne"
      />
    </label>
  );
}
