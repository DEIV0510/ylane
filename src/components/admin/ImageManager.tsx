'use client';

import { useActionState, useState, useTransition } from 'react';
import Image from 'next/image';
import { agregarImagen, definirPrincipal, eliminarImagen } from '@/app/actions/admin';
import { Aviso, SubmitButton } from './ui';
import type { ProductImage } from '@/db/schema';

const TIPOS = [
  { valor: 'principal', etiqueta: 'Principal' },
  { valor: 'secundaria', etiqueta: 'Secundaria' },
  { valor: 'galeria', etiqueta: 'Galería' },
  { valor: 'lifestyle', etiqueta: 'Lifestyle' },
  { valor: 'notas', etiqueta: 'Notas' },
];

export function ImageManager({
  productId,
  imagenes,
}: {
  productId: number;
  imagenes: ProductImage[];
}) {
  const [estado, accion] = useActionState(agregarImagen, null);
  const [pendiente, iniciar] = useTransition();
  const [subiendo, setSubiendo] = useState(false);
  const [urlSubida, setUrlSubida] = useState('');
  const [errorSubida, setErrorSubida] = useState('');

  const subir = async (archivo: File) => {
    setSubiendo(true);
    setErrorSubida('');
    try {
      const datos = new FormData();
      datos.append('archivo', archivo);
      const respuesta = await fetch('/api/admin/upload', { method: 'POST', body: datos });
      const cuerpo = (await respuesta.json()) as { url?: string; error?: string };
      if (!respuesta.ok || !cuerpo.url) throw new Error(cuerpo.error ?? 'Error al subir');
      setUrlSubida(cuerpo.url);
    } catch (fallo) {
      setErrorSubida(fallo instanceof Error ? fallo.message : 'No se pudo subir la imagen');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <section className="border border-[var(--surface-line)] p-5">
      <h2 className="font-[family-name:var(--font-display)] text-lg">Imágenes</h2>
      <p className="mt-1 text-[0.78rem] text-[var(--surface-muted)]">
        Sube la fotografía real de la referencia. Mientras no haya imagen, la tienda muestra un
        marcador con la identidad de YLANE.
      </p>

      {imagenes.length > 0 && (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {imagenes.map((imagen) => (
            <li key={imagen.id} className="border border-[var(--surface-line)]">
              <span className="relative block aspect-square bg-[var(--surface-input)]">
                <Image
                  src={imagen.url}
                  alt={imagen.alt ?? ''}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
              </span>
              <div className="space-y-1 p-2">
                <p className="text-[0.62rem] uppercase tracking-[0.12em] text-[var(--surface-muted)]">
                  {imagen.tipo}
                </p>
                <div className="flex gap-3 text-[0.66rem] uppercase tracking-[0.1em]">
                  {imagen.tipo !== 'principal' && (
                    <button
                      type="button"
                      disabled={pendiente}
                      onClick={() => iniciar(() => void definirPrincipal(imagen.id))}
                      className="text-vino hover:underline disabled:opacity-50"
                    >
                      Principal
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={pendiente}
                    onClick={() => {
                      if (window.confirm('¿Eliminar esta imagen?')) {
                        iniciar(() => void eliminarImagen(imagen.id));
                      }
                    }}
                    className="text-red-700 hover:underline disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 border-t border-[var(--surface-line)] pt-5">
        <label className="block">
          <span className="mb-1.5 block text-[0.62rem] uppercase tracking-[0.18em] text-[var(--surface-muted)]">
            Subir archivo
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            disabled={subiendo}
            onChange={(evento) => {
              const archivo = evento.target.files?.[0];
              if (archivo) void subir(archivo);
            }}
            className="block w-full text-[0.8rem] file:mr-3 file:border file:border-[var(--surface-line)] file:bg-[var(--surface-card)] file:px-4 file:py-2 file:text-[0.7rem] file:uppercase file:tracking-[0.12em]"
          />
        </label>
        {subiendo && <p className="mt-2 text-[0.78rem] text-[var(--surface-muted)]">Subiendo…</p>}
        {errorSubida && <p className="mt-2 text-[0.78rem] text-red-700">{errorSubida}</p>}

        <form action={accion} className="mt-4 grid gap-3 sm:grid-cols-4">
          <input type="hidden" name="productId" value={productId} />
          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-[0.62rem] uppercase tracking-[0.18em] text-[var(--surface-muted)]">
              URL de la imagen
            </span>
            <input
              name="url"
              required
              value={urlSubida}
              onChange={(evento) => setUrlSubida(evento.target.value)}
              placeholder="/uploads/archivo.jpg"
              className="w-full border border-[var(--surface-line)] bg-[var(--surface-card)] px-3 py-2.5 text-sm outline-none focus:border-vino"
            />
          </label>
          <label>
            <span className="mb-1.5 block text-[0.62rem] uppercase tracking-[0.18em] text-[var(--surface-muted)]">
              Tipo
            </span>
            <select
              name="tipo"
              defaultValue={imagenes.length === 0 ? 'principal' : 'galeria'}
              className="w-full border border-[var(--surface-line)] bg-[var(--surface-card)] px-3 py-2.5 text-sm outline-none focus:border-vino"
            >
              {TIPOS.map((tipo) => (
                <option key={tipo.valor} value={tipo.valor}>
                  {tipo.etiqueta}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-[0.62rem] uppercase tracking-[0.18em] text-[var(--surface-muted)]">
              Texto alternativo
            </span>
            <input
              name="alt"
              className="w-full border border-[var(--surface-line)] bg-[var(--surface-card)] px-3 py-2.5 text-sm outline-none focus:border-vino"
            />
          </label>
          <div className="sm:col-span-4">
            <SubmitButton variante="contorno">Agregar imagen</SubmitButton>
          </div>
        </form>

        <div className="mt-3">
          <Aviso estado={estado} />
        </div>
      </div>
    </section>
  );
}
