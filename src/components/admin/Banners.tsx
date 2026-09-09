'use client';

import { useActionState, useState, useTransition } from 'react';
import { eliminarBanner, guardarBanner } from '@/app/actions/admin';
import { AreaTexto, Aviso, Campo, Interruptor, Selector, SubmitButton } from './ui';
import type { Banner } from '@/db/schema';

const UBICACIONES = [
  { valor: 'hero', etiqueta: 'Hero (portada)' },
  { valor: 'promo', etiqueta: 'Banda promocional' },
  { valor: 'mayoristas', etiqueta: 'Mayoristas' },
];

export function BannerFormulario({ banner }: { banner?: Banner }) {
  const [estado, accion] = useActionState(guardarBanner, null);

  return (
    <form action={accion} className="grid gap-4 border border-[var(--surface-line)] p-5 sm:grid-cols-3">
      {banner && <input type="hidden" name="id" value={banner.id} />}

      <Selector
        nombre="ubicacion"
        etiqueta="Ubicación"
        valor={banner?.ubicacion ?? 'hero'}
        opciones={UBICACIONES}
      />
      <Campo nombre="orden" etiqueta="Orden" valor={banner?.orden ?? 0} tipo="number" />
      <Campo nombre="imagen" etiqueta="Imagen (URL)" valor={banner?.imagen} />

      <Campo nombre="titulo" etiqueta="Título" valor={banner?.titulo} />
      <Campo nombre="subtitulo" etiqueta="Subtítulo" valor={banner?.subtitulo} />
      <Campo nombre="ctaTexto" etiqueta="Botón principal" valor={banner?.ctaTexto} />

      <AreaTexto
        nombre="texto"
        etiqueta="Texto"
        valor={banner?.texto}
        filas={2}
        className="sm:col-span-3"
      />

      <Campo nombre="ctaUrl" etiqueta="Enlace botón principal" valor={banner?.ctaUrl} />
      <Campo
        nombre="ctaSecundarioTexto"
        etiqueta="Botón secundario"
        valor={banner?.ctaSecundarioTexto}
      />
      <Campo
        nombre="ctaSecundarioUrl"
        etiqueta="Enlace botón secundario"
        valor={banner?.ctaSecundarioUrl}
      />

      <div className="flex flex-wrap items-center gap-6 sm:col-span-3">
        <Interruptor nombre="activo" etiqueta="Activo" activo={banner?.activo ?? true} />
        <SubmitButton variante={banner ? 'contorno' : 'principal'}>
          {banner ? 'Guardar' : 'Crear banner'}
        </SubmitButton>
        <Aviso estado={estado} />
      </div>
    </form>
  );
}

export function BannerFila({ banner }: { banner: Banner }) {
  const [editando, setEditando] = useState(false);
  const [pendiente, iniciar] = useTransition();

  return (
    <div className="border border-[var(--surface-line)]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-[0.9rem]">
            {banner.titulo ?? 'Sin título'}
            {!banner.activo && (
              <span className="ml-2 text-[0.68rem] uppercase tracking-[0.12em] text-[var(--surface-muted)]">
                (inactivo)
              </span>
            )}
          </p>
          <p className="text-[0.72rem] text-[var(--surface-muted)]">
            {banner.ubicacion} · orden {banner.orden}
          </p>
        </div>
        <div className="flex gap-4 text-[0.68rem] uppercase tracking-[0.12em]">
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
              if (window.confirm('¿Eliminar este banner?')) {
                iniciar(() => void eliminarBanner(banner.id));
              }
            }}
            className="text-red-700 hover:underline disabled:opacity-50"
          >
            Eliminar
          </button>
        </div>
      </div>
      {editando && (
        <div className="border-t border-[var(--surface-line)] p-3">
          <BannerFormulario banner={banner} />
        </div>
      )}
    </div>
  );
}
