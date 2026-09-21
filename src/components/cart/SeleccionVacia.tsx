import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';

/**
 * Estado vacío del carrito (cajón, página y checkout). Dos salidas: el
 * catálogo como acción principal y Descubre como alternativa guiada.
 */
export function SeleccionVacia({
  titulo = 'Aún no has elegido ninguna fragancia.',
  texto = 'Recorre el catálogo o descubre, con unas pocas preguntas, la que va contigo.',
  nivel = 'h2',
  compacto = false,
  alNavegar,
}: {
  titulo?: string;
  texto?: string;
  /** `p` dentro del cajón, que ya tiene su propio título. */
  nivel?: 'h2' | 'p';
  /** Cajón: botón a todo el ancho y el enlace debajo. */
  compacto?: boolean;
  /** Se llama al elegir un enlace (el cajón se cierra al navegar). */
  alNavegar?: () => void;
}) {
  const Titulo = nivel;

  return (
    <div className={compacto ? '' : 'max-w-xl'}>
      <span aria-hidden="true" className="block h-px w-10 bg-[var(--acento)]" />
      <Titulo
        className={`mt-6 font-[family-name:var(--font-display)] font-normal leading-[1.08] ${
          compacto ? 'text-[1.875rem]' : 'display-md'
        }`}
      >
        {titulo}
      </Titulo>
      <p className="mt-4 max-w-[26rem] text-base leading-relaxed text-[var(--surface-muted)] lg:text-[0.9375rem]">
        {texto}
      </p>
      <div
        className={`mt-9 flex gap-x-8 gap-y-2 ${
          compacto ? 'flex-col' : 'flex-col items-start sm:flex-row sm:items-center'
        }`}
      >
        <ButtonLink
          href="/perfumes"
          onClick={alNavegar}
          tamano={compacto ? 'lg' : 'md'}
          className={compacto ? 'w-full' : ''}
        >
          Ver catálogo
        </ButtonLink>
        <Link href="/descubre" onClick={alNavegar} className={`link-flecha group ${compacto ? 'self-center' : ''}`}>
          Descubre tu fragancia
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
