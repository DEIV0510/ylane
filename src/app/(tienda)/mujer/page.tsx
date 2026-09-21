import type { Metadata } from 'next';
import { CatalogView, type ParametrosBusqueda } from '@/components/product/CatalogView';

export const revalidate = 120;

export const metadata: Metadata = {
  title: 'Perfumes para mujer',
  description: 'Catálogo de perfumería femenina en YLANE PERFUMES: fragancias de diseñador, árabes y nicho.',
  alternates: { canonical: '/mujer' },
};

export default async function Pagina({
  searchParams,
}: {
  searchParams: Promise<ParametrosBusqueda>;
}) {
  const params = await searchParams;
  return (
    <CatalogView
      eyebrow="Mujer"
      titulo="Perfumería femenina"
      descripcion="Fragancias femeninas seleccionadas por YLANE: de diseñador, árabes y nicho."
      params={params}
      base={{ genero: ['DAMA'] }}
      bloqueadas={['genero']}
      rutaBase="/mujer"
      imagen="/editorial/coleccion-mujer.jpg"
    />
  );
}
