'use client';

import { useActionState, useState } from 'react';
import { guardarContenido } from '@/app/actions/admin';
import { Aviso, SubmitButton } from './ui';
import type { ContentBlock } from '@/db/schema';

export function BloqueContenido({
  bloque,
  plantilla,
}: {
  bloque: ContentBlock;
  plantilla?: string;
}) {
  const [estado, accion] = useActionState(guardarContenido, null);
  const [texto, setTexto] = useState(bloque.contenido);
  const [abierto, setAbierto] = useState(bloque.contenido.trim().length === 0);

  return (
    <div className="border border-[var(--surface-line)]">
      <button
        type="button"
        onClick={() => setAbierto((valor) => !valor)}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
      >
        <span>
          <span className="block text-[0.9rem]">{bloque.titulo}</span>
          <span className="block text-[0.72rem] text-[var(--surface-muted)]">
            {bloque.contenido.trim() ? `${bloque.contenido.length} caracteres` : 'Vacío'}
            {bloque.descripcion ? ` · ${bloque.descripcion}` : ''}
          </span>
        </span>
        <span aria-hidden="true" className="text-vino">
          {abierto ? '−' : '+'}
        </span>
      </button>

      {abierto && (
        <form action={accion} className="space-y-3 border-t border-[var(--surface-line)] p-4">
          <input type="hidden" name="clave" value={bloque.clave} />
          <textarea
            name="contenido"
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
            rows={12}
            className="w-full border border-[var(--surface-line)] bg-[var(--surface-card)] px-3 py-2.5 font-mono text-[0.8rem] leading-relaxed outline-none focus:border-vino"
          />
          <div className="flex flex-wrap items-center gap-4">
            <SubmitButton>Guardar</SubmitButton>
            {plantilla && (
              <button
                type="button"
                onClick={() => setTexto(plantilla)}
                className="text-[0.68rem] uppercase tracking-[0.12em] text-[var(--surface-muted)] hover:text-vino"
              >
                Cargar estructura sugerida
              </button>
            )}
            <Aviso estado={estado} />
          </div>
        </form>
      )}
    </div>
  );
}
