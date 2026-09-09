import Link from 'next/link';
import { EmptyState } from '@/components/ui/Bits';

export default function NotFoundTienda() {
  return (
    <div data-surface="oscuro" className="shell py-24">
      <EmptyState
        titulo="No encontramos esta página"
        texto="El enlace puede estar roto o la referencia ya no está disponible en el catálogo."
      >
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/perfumes"
            className="border border-vino bg-vino px-8 py-3.5 text-[0.7rem] uppercase tracking-[0.18em] text-marfil transition-colors hover:bg-vino-glow"
          >
            Ver catálogo
          </Link>
          <Link
            href="/"
            className="border border-current/35 px-8 py-3.5 text-[0.7rem] uppercase tracking-[0.18em] transition-colors hover:border-champagne hover:text-champagne"
          >
            Ir al inicio
          </Link>
        </div>
      </EmptyState>
    </div>
  );
}
