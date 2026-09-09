'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCOP, GENERO_ETIQUETA } from '@/lib/format';
import { ProductPlaceholder } from '@/components/product/ProductPlaceholder';
import { trackEvento } from '@/lib/analytics';

type Sugerencia = {
  id: number;
  slug: string;
  nombre: string;
  codigo: string;
  genero: string;
  precio: number | null;
  marca: string | null;
  imagen: string | null;
};

const ATAJOS = ['Árabes', 'Lattafa', 'Creed', 'Hombre', 'Mujer', 'Nicho'];

export function SearchOverlay({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const [termino, setTermino] = useState('');
  const [resultados, setResultados] = useState<Sugerencia[]>([]);
  const [cargando, setCargando] = useState(false);
  const entrada = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!abierto) return;
    const foco = window.setTimeout(() => entrada.current?.focus(), 90);
    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', alPulsar);
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(foco);
      document.removeEventListener('keydown', alPulsar);
      document.body.style.overflow = anterior;
    };
  }, [abierto, onCerrar]);

  useEffect(() => {
    if (!abierto) return;
    const texto = termino.trim();
    if (texto.length < 2) {
      setResultados([]);
      setCargando(false);
      return;
    }
    setCargando(true);
    const control = new AbortController();
    const temporizador = window.setTimeout(async () => {
      try {
        const respuesta = await fetch(`/api/buscar?q=${encodeURIComponent(texto)}`, {
          signal: control.signal,
        });
        if (!respuesta.ok) throw new Error('respuesta no válida');
        const datos = (await respuesta.json()) as { items: Sugerencia[] };
        setResultados(datos.items ?? []);
        trackEvento('Search', { search_string: texto });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') setResultados([]);
      } finally {
        setCargando(false);
      }
    }, 220);

    return () => {
      control.abort();
      window.clearTimeout(temporizador);
    };
  }, [termino, abierto]);

  const irAlCatalogo = (texto: string) => {
    const consulta = texto.trim();
    if (!consulta) return;
    onCerrar();
    router.push(`/perfumes?q=${encodeURIComponent(consulta)}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Buscar perfumes"
      aria-hidden={!abierto}
      className={`fixed inset-0 z-80 transition-opacity duration-300 ${
        abierto ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="absolute inset-0 bg-noir/95 backdrop-blur-xl" onClick={onCerrar} />

      <div className="relative flex h-dvh flex-col">
        <div className="shell flex items-center gap-4 border-b border-[var(--surface-line)] py-5">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            className="shrink-0 text-champagne"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.6-3.6" />
          </svg>
          <input
            ref={entrada}
            value={termino}
            onChange={(evento) => setTermino(evento.target.value)}
            onKeyDown={(evento) => {
              if (evento.key === 'Enter') irAlCatalogo(termino);
            }}
            type="search"
            enterKeyHint="search"
            placeholder="Busca por nombre, marca o código…"
            aria-label="Término de búsqueda"
            className="w-full bg-transparent py-2 font-[family-name:var(--font-display)] text-xl text-marfil outline-none placeholder:text-[var(--surface-muted)] placeholder:font-[family-name:var(--font-sans)] placeholder:text-base md:text-3xl"
          />
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar búsqueda"
            className="shrink-0 p-2 text-marfil-dim transition-colors hover:text-champagne"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="shell flex-1 overflow-y-auto py-6">
          {termino.trim().length < 2 ? (
            <div>
              <p className="eyebrow mb-4">Búsquedas frecuentes</p>
              <div className="flex flex-wrap gap-2">
                {ATAJOS.map((atajo) => (
                  <button
                    key={atajo}
                    type="button"
                    onClick={() => setTermino(atajo)}
                    className="border border-[var(--surface-line)] px-4 py-2 text-[0.68rem] uppercase tracking-[0.16em] text-marfil-dim transition-colors hover:border-champagne hover:text-champagne"
                  >
                    {atajo}
                  </button>
                ))}
              </div>
            </div>
          ) : cargando && resultados.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--surface-muted)]">Buscando…</p>
          ) : resultados.length === 0 ? (
            <div className="py-10 text-center">
              <p className="font-[family-name:var(--font-display)] text-xl">Sin resultados</p>
              <p className="mt-2 text-sm text-[var(--surface-muted)]">
                Prueba con la marca, el código de referencia o una palabra del nombre.
              </p>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-[var(--surface-line)]">
                {resultados.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/perfumes/${item.slug}`}
                      onClick={onCerrar}
                      className="group flex items-center gap-4 py-3"
                    >
                      <span className="relative size-14 shrink-0 overflow-hidden bg-noir-soft">
                        {item.imagen ? (
                          <Image src={item.imagen} alt={item.nombre} fill sizes="56px" className="object-cover" />
                        ) : (
                          <ProductPlaceholder codigo={item.codigo} compacto className="size-full" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[0.58rem] uppercase tracking-[0.2em] text-champagne/80">
                          {item.marca ?? GENERO_ETIQUETA[item.genero]} · {item.codigo}
                        </span>
                        <span className="block truncate font-[family-name:var(--font-display)] text-base transition-colors group-hover:text-champagne">
                          {item.nombre}
                        </span>
                      </span>
                      <span className="shrink-0 text-[0.8rem] text-marfil-dim">
                        {formatCOP(item.precio) ?? '—'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => irAlCatalogo(termino)}
                className="mt-6 w-full border border-[var(--surface-line)] py-3 text-[0.68rem] uppercase tracking-[0.2em] text-marfil-dim transition-colors hover:border-champagne hover:text-champagne"
              >
                Ver todos los resultados
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
