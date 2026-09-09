'use client';

import { useActionState, useState, useTransition } from 'react';
import Link from 'next/link';
import { asignarMarcaMasivo, eliminarMarca, guardarMarca } from '@/app/actions/admin';
import { Aviso, SubmitButton } from './ui';
import { TIPO_ETIQUETA } from '@/lib/format';

type Marca = {
  id: number;
  nombre: string;
  slug: string;
  origen: string | null;
  descripcion: string | null;
  total: number;
};

const ORIGENES = [
  { valor: '', etiqueta: 'Sin clasificar' },
  { valor: 'arabe', etiqueta: 'Árabe' },
  { valor: 'nicho', etiqueta: 'Nicho' },
  { valor: 'disenador', etiqueta: 'Diseñador' },
  { valor: 'comercial', etiqueta: 'Comercial' },
];

export function MarcaFormulario({ marca }: { marca?: Marca }) {
  const [estado, accion] = useActionState(guardarMarca, null);

  return (
    <form action={accion} className="grid gap-3 border border-[var(--surface-line)] p-4 sm:grid-cols-4">
      {marca && <input type="hidden" name="id" value={marca.id} />}
      <label>
        <span className="mb-1.5 block text-[0.6rem] uppercase tracking-[0.18em] text-[var(--surface-muted)]">
          Nombre
        </span>
        <input
          name="nombre"
          required
          defaultValue={marca?.nombre ?? ''}
          className="w-full border border-[var(--surface-line)] bg-[var(--surface-card)] px-3 py-2 text-sm outline-none focus:border-vino"
        />
      </label>
      <label>
        <span className="mb-1.5 block text-[0.6rem] uppercase tracking-[0.18em] text-[var(--surface-muted)]">
          Clasificación
        </span>
        <select
          name="origen"
          defaultValue={marca?.origen ?? ''}
          className="w-full border border-[var(--surface-line)] bg-[var(--surface-card)] px-3 py-2 text-sm outline-none focus:border-vino"
        >
          {ORIGENES.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.etiqueta}
            </option>
          ))}
        </select>
      </label>
      <label className="sm:col-span-2">
        <span className="mb-1.5 block text-[0.6rem] uppercase tracking-[0.18em] text-[var(--surface-muted)]">
          Descripción (opcional)
        </span>
        <input
          name="descripcion"
          defaultValue={marca?.descripcion ?? ''}
          className="w-full border border-[var(--surface-line)] bg-[var(--surface-card)] px-3 py-2 text-sm outline-none focus:border-vino"
        />
      </label>
      <div className="sm:col-span-4 flex flex-wrap items-center gap-4">
        <SubmitButton variante={marca ? 'contorno' : 'principal'}>
          {marca ? 'Guardar' : 'Crear marca'}
        </SubmitButton>
        <Aviso estado={estado} />
      </div>
    </form>
  );
}

export function MarcaFila({ marca }: { marca: Marca }) {
  const [editando, setEditando] = useState(false);
  const [pendiente, iniciar] = useTransition();

  return (
    <li className="px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.9rem]">{marca.nombre}</p>
          <p className="text-[0.72rem] text-[var(--surface-muted)]">
            {marca.total} {marca.total === 1 ? 'referencia' : 'referencias'}
            {marca.origen ? ` · ${TIPO_ETIQUETA[marca.origen] ?? marca.origen}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-4 text-[0.68rem] uppercase tracking-[0.12em]">
          <Link
            href={`/marcas/${marca.slug}`}
            target="_blank"
            className="text-[var(--surface-muted)] hover:text-vino"
          >
            Ver
          </Link>
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
              if (
                window.confirm(
                  `¿Eliminar la marca "${marca.nombre}"? Sus ${marca.total} referencias quedarán sin marca.`,
                )
              ) {
                iniciar(() => void eliminarMarca(marca.id));
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
          <MarcaFormulario marca={marca} />
        </div>
      )}
    </li>
  );
}

export function AsignarMarca({
  marcas,
  productos,
}: {
  marcas: { id: number; nombre: string }[];
  productos: { id: number; codigo: string; nombre: string }[];
}) {
  const [estado, accion] = useActionState(asignarMarcaMasivo, null);
  const [filtro, setFiltro] = useState('');

  const visibles = productos.filter((producto) =>
    `${producto.nombre} ${producto.codigo}`.toLowerCase().includes(filtro.toLowerCase()),
  );

  return (
    <form action={accion} className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <label>
          <span className="mb-1.5 block text-[0.6rem] uppercase tracking-[0.18em] text-[var(--surface-muted)]">
            Asignar a la marca
          </span>
          <select
            name="marcaId"
            required
            className="border border-[var(--surface-line)] bg-[var(--surface-card)] px-3 py-2 text-sm outline-none focus:border-vino"
          >
            <option value="">Selecciona…</option>
            {marcas.map((marca) => (
              <option key={marca.id} value={marca.id}>
                {marca.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-48 flex-1">
          <span className="mb-1.5 block text-[0.6rem] uppercase tracking-[0.18em] text-[var(--surface-muted)]">
            Filtrar lista
          </span>
          <input
            value={filtro}
            onChange={(evento) => setFiltro(evento.target.value)}
            placeholder="Buscar referencia"
            className="w-full border border-[var(--surface-line)] bg-[var(--surface-card)] px-3 py-2 text-sm outline-none focus:border-vino"
          />
        </label>
        <SubmitButton>Asignar</SubmitButton>
      </div>

      <div className="max-h-64 overflow-y-auto border border-[var(--surface-line)] bg-[var(--surface-card)] p-3">
        {visibles.map((producto) => (
          <label key={producto.id} className="flex items-center gap-2 py-1 text-[0.82rem]">
            <input
              type="checkbox"
              name="ids"
              value={producto.id}
              className="size-3.5 accent-[var(--color-vino)]"
            />
            <span className="truncate">
              {producto.nombre}
              <span className="text-[var(--surface-muted)]"> · {producto.codigo}</span>
            </span>
          </label>
        ))}
        {visibles.length === 0 && (
          <p className="text-[0.8rem] text-[var(--surface-muted)]">Sin coincidencias.</p>
        )}
      </div>

      <Aviso estado={estado} />
    </form>
  );
}
