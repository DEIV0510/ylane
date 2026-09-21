import { NoEncontrado } from '@/components/content/NoEncontrado';

/** 404 dentro de la tienda (una referencia retirada, un enlace roto): conserva cabecera y pie. */
export default function NotFoundTienda() {
  return (
    <section
      data-surface="oscuro"
      className="shell flex min-h-[70svh] items-center justify-center py-24 lg:py-32"
    >
      <NoEncontrado />
    </section>
  );
}
