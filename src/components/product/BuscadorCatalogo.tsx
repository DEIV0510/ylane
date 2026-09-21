'use client';

import Form from 'next/form';
import { useId } from 'react';
import { Button } from '@/components/ui/Button';
import { trackEvento } from '@/lib/analytics';

/**
 * Buscador grande del catálogo: un formulario GET a la misma ruta (?q=).
 * Con JS navega sin recargar la página (next/form); sin JS es un formulario
 * normal. Conserva el orden elegido y, como no envía `pagina`, siempre vuelve
 * a la primera página de resultados.
 */
export function BuscadorCatalogo({
  accion,
  consulta = '',
  orden,
}: {
  accion: string;
  consulta?: string;
  orden?: string;
}) {
  const id = useId();

  return (
    <Form
      action={accion}
      role="search"
      aria-label="Buscar en el catálogo"
      onSubmit={(evento) => {
        const texto = String(new FormData(evento.currentTarget).get('q') ?? '').trim();
        if (texto) trackEvento('Search', { search_string: texto });
      }}
      className="mt-10 flex items-center gap-3 border-b border-[var(--surface-control)] transition-[border-color,box-shadow] duration-300 ease-[var(--ease-silk)] focus-within:border-[var(--foco)] focus-within:shadow-[inset_0_-1px_0_var(--foco)] sm:gap-4 lg:mt-12"
    >
      <label htmlFor={id} className="sr-only">
        Buscar por nombre, marca o código
      </label>
      <svg
        aria-hidden="true"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        className="shrink-0 text-[var(--surface-muted)]"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.6-3.6" />
      </svg>
      {/* 24 px en móvil: con menos de 16 px iOS amplía la página al enfocar. */}
      <input
        id={id}
        name="q"
        type="search"
        defaultValue={consulta}
        placeholder="Nombre, marca o código"
        enterKeyHint="search"
        autoComplete="off"
        spellCheck={false}
        className="h-16 min-w-0 flex-1 bg-transparent font-[family-name:var(--font-display)] text-[1.5rem] leading-none outline-hidden placeholder:font-[family-name:var(--font-sans)] placeholder:text-base placeholder:text-[var(--surface-muted)] lg:h-[4.5rem] lg:text-[2rem] [&::-webkit-search-cancel-button]:appearance-none"
      />
      {orden && <input type="hidden" name="orden" value={orden} />}
      {/* Por debajo de 360 px sólo la flecha: el campo necesita el ancho para la pista.
          Rangos sin solaparse, así el orden de las media queries en el CSS no importa. */}
      <Button
        type="submit"
        className="shrink-0 max-sm:min-[360px]:px-5 max-[360px]:size-12 max-[360px]:px-0"
      >
        <span className="max-[360px]:sr-only">Buscar</span>
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          className="min-[360px]:hidden"
        >
          <path d="M4 12h15M13.5 6.5L19 12l-5.5 5.5" />
        </svg>
      </Button>
    </Form>
  );
}
