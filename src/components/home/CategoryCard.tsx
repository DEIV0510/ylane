import Image from 'next/image';
import Link from 'next/link';
import { CategoryArt } from './HeroArt';

export type CategoriaHome = {
  slug: string;
  nombre: string;
  descripcion: string | null;
  imagen: string | null;
  href: string;
  total: number;
  destacada?: boolean;
};

export function CategoryCard({
  categoria,
  ancha = false,
}: {
  categoria: CategoriaHome;
  ancha?: boolean;
}) {
  return (
    <Link
      href={categoria.href}
      data-reveal
      className={`group relative flex overflow-hidden border border-[var(--surface-line)] transition-colors duration-500 hover:border-champagne/60 ${
        ancha ? 'min-h-[22rem] md:col-span-2 md:row-span-2 md:min-h-[30rem]' : 'min-h-[15rem]'
      }`}
    >
      <span className="absolute inset-0">
        {categoria.imagen ? (
          <Image
            src={categoria.imagen}
            alt=""
            fill
            sizes={ancha ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
            className="object-cover transition-transform duration-[900ms] ease-[var(--ease-silk)] group-hover:scale-105"
          />
        ) : (
          <CategoryArt
            slug={categoria.slug}
            className="size-full object-cover transition-transform duration-[900ms] ease-[var(--ease-silk)] group-hover:scale-105"
          />
        )}
      </span>

      <span className="absolute inset-0 bg-linear-to-t from-noir/90 via-noir/25 to-transparent" />

      <span className="relative z-10 mt-auto flex w-full flex-col gap-1 p-5 md:p-6">
        <span className="text-[0.58rem] uppercase tracking-[0.24em] text-champagne">
          {categoria.total > 0 ? `${categoria.total} referencias` : 'Colección'}
        </span>
        <span
          className={`font-[family-name:var(--font-display)] leading-none text-marfil ${
            ancha ? 'text-4xl md:text-5xl' : 'text-2xl'
          }`}
        >
          {categoria.nombre}
        </span>
        {categoria.descripcion && ancha && (
          <span className="mt-2 max-w-sm text-[0.85rem] leading-relaxed text-marfil-dim">
            {categoria.descripcion}
          </span>
        )}
        <span className="mt-3 inline-flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.22em] text-marfil-dim transition-colors group-hover:text-champagne">
          Ver colección
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </span>
      </span>
    </Link>
  );
}
