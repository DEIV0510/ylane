'use client';

import { useActionState, useState, useTransition } from 'react';
import { eliminarCategoria, guardarCategoria } from '@/app/actions/admin';
import { Aviso, SubmitButton } from './ui';
import type { Category } from '@/db/schema';

export function CategoriaFormulario({ categoria }: { categoria?: Category }) {
  const [estado, accion] = useActionState(guardarCategoria, null);

  return (
    <form action={accion} className="grid gap-3 border border-[var(--surface-line)] p-4 sm:grid-cols-4">
      {categoria && <input type="hidden" name="id" value={categoria.id} />}

      <Entrada nombre="nombre" etiqueta="Nombre" valor={categoria?.nombre} requerido />
      <Entrada
        nombre="filtro"
        etiqueta="Filtro"
        valor={categoria?.filtro ?? ''}
        placeholder="tipo:arabe"
      />
      <Entrada nombre="orden" etiqueta="Orden" valor={String(categoria?.orden ?? 0)} tipo="number" />
      <Entrada nombre="imagen" etiqueta="Imagen (URL)" valor={categoria?.imagen ?? ''} />
      <Entrada
        nombre="descripcion"
        etiqueta="Descripción"
        valor={categoria?.descripcion ?? ''}
        className="sm:col-span-4"
      />

      <div className="flex flex-wrap items-center gap-6 sm:col-span-4">
        <label className="flex items-center gap-2 text-[0.82rem]">
          <input
            type="checkbox"
            name="activa"
            defaultChecked={categoria?.activa ?? true}
            className="size-4 accent-[var(--color-vino)]"
          />
          Activa
        </label>
        <label className="flex items-center gap-2 text-[0.82rem]">
          <input
            type="checkbox"
            name="destacadaHome"
            defaultChecked={categoria?.destacadaHome ?? true}
            className="size-4 accent-[var(--color-vino)]"
          />
          Mostrar en la portada
        </label>
        <SubmitButton variante={categoria ? 'contorno' : 'principal'}>
          {categoria ? 'Guardar' : 'Crear categoría'}
        </SubmitButton>
        <Aviso estado={estado} />
      </div>
    </form>
  );
}

export function CategoriaFila({ categoria }: { categoria: Category }) {
  const [editando, setEditando] = useState(false);
  const [pendiente, iniciar] = useTransition();

  return (
    <li className="px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[0.9rem]">
            {categoria.nombre}
            {!categoria.activa && (
              <span className="ml-2 text-[0.68rem] uppercase tracking-[0.12em] text-[var(--surface-muted)]">
                (oculta)
              </span>
            )}
          </p>
          <p className="text-[0.72rem] text-[var(--surface-muted)]">
            /{categoria.slug} · {categoria.filtro ?? 'sin filtro'}
            {categoria.destacadaHome ? ' · en portada' : ''}
          </p>
        </div>
        <div className="flex items-center gap-4 text-[0.68rem] uppercase tracking-[0.12em]">
          <button
            type="button"
            onClick={() => setEditando((valor) => !valor)}
            className="text-vino hover:underline"
          >
            {editando ? 'Cerrar' : 'Editar'}
          </button>
          <button
            type="button"
            disabled={pendiente}
            onClick={() => {
              if (window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) {
                iniciar(() => void eliminarCategoria(categoria.id));
              }
            }}
            className="text-red-700 hover:underline disabled:opacity-50"
          >
            Eliminar
          </button>
        </div>
      </div>
      {editando && (
        <div className="mt-4">
          <CategoriaFormulario categoria={categoria} />
        </div>
      )}
    </li>
  );
}

function Entrada({
  nombre,
  etiqueta,
  valor,
  tipo = 'text',
  requerido = false,
  placeholder,
  className = '',
}: {
  nombre: string;
  etiqueta: string;
  valor?: string | null;
  tipo?: string;
  requerido?: boolean;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-[0.6rem] uppercase tracking-[0.18em] text-[var(--surface-muted)]">
        {etiqueta}
      </span>
      <input
        name={nombre}
        type={tipo}
        required={requerido}
        defaultValue={valor ?? ''}
        placeholder={placeholder}
        className="w-full border border-[var(--surface-line)] bg-[var(--surface-card)] px-3 py-2 text-sm outline-none focus:border-vino"
      />
    </label>
  );
}
