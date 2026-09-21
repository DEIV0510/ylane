import { NoEncontrado } from '@/components/content/NoEncontrado';

/**
 * 404 de las rutas que no existen. Se muestra fuera del layout de la tienda
 * (sin cabecera ni pie), así que se sostiene sola a pantalla completa.
 */
export default function NotFound() {
  return (
    <main data-surface="oscuro" className="flex min-h-dvh items-center justify-center px-5 py-16">
      <NoEncontrado />
    </main>
  );
}
