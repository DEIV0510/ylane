import Link from 'next/link';
import { Monograma } from '@/components/brand/Logo';

export default function NotFound() {
  return (
    <main
      data-surface="oscuro"
      className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center"
    >
      <Monograma className="h-10 w-auto text-champagne" />
      <p className="eyebrow">Error 404</p>
      <h1 className="display-lg">Esta página no existe</h1>
      <p className="max-w-md text-[0.95rem] text-[var(--surface-muted)]">
        El enlace puede estar roto o la referencia ya no está en el catálogo.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/perfumes"
          className="border border-vino bg-vino px-8 py-4 text-[0.7rem] uppercase tracking-[0.18em] text-marfil transition-colors hover:bg-vino-glow"
        >
          Ver catálogo
        </Link>
        <Link
          href="/"
          className="border border-current/35 px-8 py-4 text-[0.7rem] uppercase tracking-[0.18em] transition-colors hover:border-champagne hover:text-champagne"
        >
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
