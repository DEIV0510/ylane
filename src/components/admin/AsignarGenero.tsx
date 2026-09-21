'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { asignarGeneroMasivo } from '@/app/actions/admin';
import { Aviso, SubmitButton } from './ui';

type Referencia = { id: number; codigo: string; nombre: string; marca: string | null };

const OPCIONES = [
  { valor: 'DAMA', etiqueta: 'Mujer' },
  { valor: 'CABALLERO', etiqueta: 'Hombre' },
  { valor: 'UNISEX', etiqueta: 'Unisex' },
];

/**
 * Asignación de género en bloque, agrupada por marca: con cientos de
 * referencias pendientes, marcar de una en una no es viable.
 */
export function AsignarGenero({ referencias }: { referencias: Referencia[] }) {
  const [estado, accion] = useActionState(asignarGeneroMasivo, null);
  const [elegidos, setElegidos] = useState<Set<number>>(new Set());
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    if (estado?.ok) setElegidos(new Set());
  }, [estado]);

  const grupos = useMemo(() => {
    const texto = filtro.trim().toLowerCase();
    const mapa = new Map<string, Referencia[]>();
    for (const referencia of referencias) {
      if (texto && !`${referencia.nombre} ${referencia.codigo} ${referencia.marca ?? ''}`.toLowerCase().includes(texto)) {
        continue;
      }
      const marca = referencia.marca ?? 'Sin marca';
      mapa.set(marca, [...(mapa.get(marca) ?? []), referencia]);
    }
    return [...mapa.entries()].sort((a, b) => a[0].localeCompare(b[0], 'es'));
  }, [referencias, filtro]);

  const alternar = (id: number) =>
    setElegidos((actual) => {
      const copia = new Set(actual);
      if (copia.has(id)) copia.delete(id);
      else copia.add(id);
      return copia;
    });

  const alternarGrupo = (ids: number[]) =>
    setElegidos((actual) => {
      const copia = new Set(actual);
      const todos = ids.every((id) => copia.has(id));
      for (const id of ids) {
        if (todos) copia.delete(id);
        else copia.add(id);
      }
      return copia;
    });

  if (referencias.length === 0) {
    return (
      <p className="border border-[var(--surface-line)] p-8 text-center text-[0.9rem]">
        Todas las referencias activas tienen género asignado.
      </p>
    );
  }

  return (
    <form action={accion} className="space-y-5">
      <div className="sticky top-0 z-10 flex flex-wrap items-end gap-4 border border-[var(--surface-line)] bg-[var(--surface-bg)] p-4">
        <fieldset className="flex flex-wrap items-center gap-4">
          <legend className="mb-1.5 text-[0.6rem] uppercase tracking-[0.18em] text-[var(--surface-muted)]">
            Asignar a las seleccionadas
          </legend>
          {OPCIONES.map((opcion) => (
            <label key={opcion.valor} className="flex items-center gap-2 text-[0.88rem]">
              <input
                type="radio"
                name="genero"
                value={opcion.valor}
                required
                className="size-4 accent-[var(--color-vino)]"
              />
              {opcion.etiqueta}
            </label>
          ))}
        </fieldset>

        <label className="min-w-48 flex-1">
          <span className="mb-1.5 block text-[0.6rem] uppercase tracking-[0.18em] text-[var(--surface-muted)]">
            Filtrar
          </span>
          <input
            value={filtro}
            onChange={(evento) => setFiltro(evento.target.value)}
            placeholder="Marca, nombre o código"
            className="w-full border border-[var(--surface-control)] bg-[var(--surface-card)] px-3 py-2 text-sm outline-none focus:border-vino"
          />
        </label>

        <div className="flex items-center gap-4">
          <span className="text-[0.8rem] text-[var(--surface-muted)]">{elegidos.size} seleccionadas</span>
          <SubmitButton>Asignar</SubmitButton>
        </div>
      </div>

      <Aviso estado={estado} />

      {[...elegidos].map((id) => (
        <input key={id} type="hidden" name="ids" value={id} />
      ))}

      <div className="space-y-4">
        {grupos.map(([marca, lista]) => {
          const ids = lista.map((referencia) => referencia.id);
          const todos = ids.every((id) => elegidos.has(id));
          return (
            <section key={marca} className="border border-[var(--surface-line)]">
              <header className="flex items-center justify-between gap-4 border-b border-[var(--surface-line)] px-4 py-2.5">
                <h2 className="text-[0.9rem] font-medium">
                  {marca} <span className="text-[var(--surface-muted)]">· {lista.length}</span>
                </h2>
                <button
                  type="button"
                  onClick={() => alternarGrupo(ids)}
                  className="text-[0.68rem] uppercase tracking-[0.12em] text-vino hover:underline"
                >
                  {todos ? 'Quitar todas' : 'Seleccionar todas'}
                </button>
              </header>
              <ul className="grid gap-x-6 px-4 py-2 sm:grid-cols-2">
                {lista.map((referencia) => (
                  <li key={referencia.id}>
                    <label className="flex cursor-pointer items-center gap-2.5 py-1.5 text-[0.84rem]">
                      <input
                        type="checkbox"
                        checked={elegidos.has(referencia.id)}
                        onChange={() => alternar(referencia.id)}
                        className="size-4 shrink-0 accent-[var(--color-vino)]"
                      />
                      <span className="min-w-0">
                        {referencia.nombre}
                        <span className="text-[var(--surface-muted)]"> · {referencia.codigo}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </form>
  );
}
