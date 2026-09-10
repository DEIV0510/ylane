'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, ButtonLink } from '@/components/ui/Button';
import { ProductCard } from '@/components/product/ProductCard';
import type { ProductoVista } from '@/lib/catalog';

type Paso = {
  clave: 'genero' | 'personalidad' | 'ocasion' | 'intensidad';
  pregunta: string;
  ayuda?: string;
  multiple: boolean;
  opciones: { valor: string; etiqueta: string }[];
};

const PASOS: Paso[] = [
  {
    clave: 'genero',
    pregunta: '¿Para quién buscas?',
    multiple: false,
    opciones: [
      { valor: 'hombre', etiqueta: 'Hombre' },
      { valor: 'mujer', etiqueta: 'Mujer' },
      { valor: 'unisex', etiqueta: 'Unisex' },
    ],
  },
  {
    clave: 'personalidad',
    pregunta: '¿Qué quieres transmitir?',
    ayuda: 'Puedes elegir más de una.',
    multiple: true,
    opciones: [
      { valor: 'elegante', etiqueta: 'Elegante' },
      { valor: 'seductor', etiqueta: 'Seductor' },
      { valor: 'fresco', etiqueta: 'Fresco' },
      { valor: 'misterioso', etiqueta: 'Misterioso' },
      { valor: 'intenso', etiqueta: 'Intenso' },
      { valor: 'dulce', etiqueta: 'Dulce' },
      { valor: 'sofisticado', etiqueta: 'Sofisticado' },
    ],
  },
  {
    clave: 'ocasion',
    pregunta: '¿Cuándo lo usarás?',
    ayuda: 'Puedes elegir más de una.',
    multiple: true,
    opciones: [
      { valor: 'dia', etiqueta: 'Día' },
      { valor: 'noche', etiqueta: 'Noche' },
      { valor: 'cita', etiqueta: 'Cita' },
      { valor: 'trabajo', etiqueta: 'Trabajo' },
      { valor: 'fiesta', etiqueta: 'Fiesta' },
      { valor: 'evento', etiqueta: 'Evento' },
    ],
  },
  {
    clave: 'intensidad',
    pregunta: '¿Qué intensidad prefieres?',
    multiple: false,
    opciones: [
      { valor: 'suave', etiqueta: 'Suave' },
      { valor: 'media', etiqueta: 'Media' },
      { valor: 'intensa', etiqueta: 'Intensa' },
    ],
  },
];

type Respuestas = Record<string, string | string[] | undefined>;
type Resultado = { conAtributos: boolean; items: (ProductoVista & { motivos: string[] })[] };

export function PerfumeFinder() {
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Respuestas>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const actual = PASOS[paso];
  const valorActual = respuestas[actual?.clave];
  const respondido = actual?.multiple
    ? Array.isArray(valorActual) && valorActual.length > 0
    : Boolean(valorActual);

  const elegir = (valor: string) => {
    setRespuestas((previas) => {
      if (!actual.multiple) return { ...previas, [actual.clave]: valor };
      const seleccion = Array.isArray(previas[actual.clave])
        ? (previas[actual.clave] as string[])
        : [];
      return {
        ...previas,
        [actual.clave]: seleccion.includes(valor)
          ? seleccion.filter((item) => item !== valor)
          : [...seleccion, valor],
      };
    });
  };

  const avanzar = async () => {
    if (paso < PASOS.length - 1) {
      setPaso(paso + 1);
      return;
    }
    setCargando(true);
    setError('');
    try {
      const respuesta = await fetch('/api/recomendaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(respuestas),
      });
      if (!respuesta.ok) throw new Error('error');
      setResultado((await respuesta.json()) as Resultado);
    } catch {
      setError('No pudimos calcular la recomendación. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const reiniciar = () => {
    setPaso(0);
    setRespuestas({});
    setResultado(null);
    setError('');
  };

  if (resultado) {
    return (
      <div>
        <div className="text-center">
          <p className="eyebrow mb-3">Tu selección</p>
          <h2 className="display-lg">
            {resultado.items.length > 0 ? 'Esto encaja contigo' : 'Sin coincidencias'}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[0.9rem] leading-relaxed text-[var(--surface-muted)]">
            {resultado.items.length === 0
              ? 'No encontramos referencias con esos criterios. Escríbenos y te ayudamos a elegir.'
              : resultado.conAtributos
                ? 'Ordenadas según lo que nos contaste. Si quieres afinar más, escríbenos y te asesoramos.'
                : 'Estas son referencias de la categoría que elegiste. Todavía estamos cargando los atributos de aroma de cada perfume, así que el orden aún no considera personalidad ni ocasión: escríbenos y te asesoramos personalmente.'}
          </p>
        </div>

        {resultado.items.length > 0 && (
          <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {resultado.items.map((producto) => (
              <div key={producto.id}>
                <ProductCard producto={producto} compacto />
                {producto.motivos.length > 0 && (
                  <p className="mt-2 text-[0.62rem] uppercase tracking-[0.14em] text-champagne">
                    {producto.motivos.slice(0, 3).join(' · ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variante="contorno" onClick={reiniciar}>
            Volver a empezar
          </Button>
          <ButtonLink href="/perfumes">Ver catálogo completo</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Progreso */}
      <div className="flex items-center gap-2" aria-hidden="true">
        {PASOS.map((item, indice) => (
          <span
            key={item.clave}
            className={`h-px flex-1 transition-colors duration-500 ${
              indice <= paso ? 'bg-champagne' : 'bg-[var(--surface-line)]'
            }`}
          />
        ))}
      </div>
      <p className="mt-4 text-[0.65rem] uppercase tracking-[0.24em] text-[var(--surface-muted)]">
        Paso {paso + 1} de {PASOS.length}
      </p>

      <h2 className="display-lg mt-4">{actual.pregunta}</h2>
      {actual.ayuda && (
        <p className="mt-2 text-[0.85rem] text-[var(--surface-muted)]">{actual.ayuda}</p>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        {actual.opciones.map((opcion) => {
          const activo = actual.multiple
            ? Array.isArray(valorActual) && valorActual.includes(opcion.valor)
            : valorActual === opcion.valor;
          return (
            <button
              key={opcion.valor}
              type="button"
              onClick={() => elegir(opcion.valor)}
              aria-pressed={activo}
              className={`border px-6 py-3.5 text-[0.7rem] uppercase tracking-[0.16em] transition-all duration-300 ${
                activo
                  ? 'border-champagne bg-champagne text-noir'
                  : 'border-[var(--surface-line)] hover:border-champagne hover:text-champagne'
              }`}
            >
              {opcion.etiqueta}
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="mt-6 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="mt-12 flex items-center justify-between gap-4">
        {paso > 0 ? (
          <Button variante="texto" onClick={() => setPaso(paso - 1)}>
            ← Atrás
          </Button>
        ) : (
          <Link
            href="/perfumes"
            className="text-[0.7rem] uppercase tracking-[0.16em] text-[var(--surface-muted)] underline-offset-4 hover:text-champagne hover:underline"
          >
            Prefiero ver el catálogo
          </Link>
        )}
        <Button onClick={avanzar} disabled={!respondido || cargando} tamano="lg">
          {cargando ? 'Calculando…' : paso === PASOS.length - 1 ? 'Ver recomendaciones' : 'Continuar'}
        </Button>
      </div>
    </div>
  );
}
