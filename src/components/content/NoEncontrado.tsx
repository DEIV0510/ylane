import { MonogramaOro } from '@/components/brand/Logo';
import { EnlaceFlecha } from '@/components/ui/Bits';
import { ButtonLink } from '@/components/ui/Button';

/**
 * Contenido de la página 404, común a la tienda (con cabecera y pie) y a las
 * rutas que no existen (fuera del layout de la tienda). Mínimo: el sello, un
 * titular y dos salidas. Va sobre superficie oscura: el dorado sólo vive ahí.
 */
export function NoEncontrado() {
  return (
    <div className="flex flex-col items-center text-center">
      <MonogramaOro className="h-16 w-auto" />
      <p className="eyebrow mt-10">Error 404</p>
      <h1 className="display-lg mt-5">Esta página no existe</h1>
      <p className="lead mx-auto mt-6">
        El enlace puede estar roto o la referencia ya no está en el catálogo.
      </p>
      <div className="mt-10 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8">
        <ButtonLink href="/perfumes" tamano="lg" className="w-full sm:w-auto">
          Ver catálogo
        </ButtonLink>
        <EnlaceFlecha href="/">Volver al inicio</EnlaceFlecha>
      </div>
    </div>
  );
}
