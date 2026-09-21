import type { Metadata } from 'next';
import { CatalogView, type ParametrosBusqueda } from '@/components/product/CatalogView';

export const revalidate = 120;

export const metadata: Metadata = {
  title: 'Perfumes unisex',
  description: 'Fragancias unisex seleccionadas por YLANE PERFUMES.',
  alternates: { canonical: '/unisex' },
};

export default async function Pagina({
  searchParams,
}: {
  searchParams: Promise<ParametrosBusqueda>;
}) {
  const params = await searchParams;
  return (
    <CatalogView
      eyebrow="Unisex"
      titulo="Fragancias unisex"
      descripcion="Fragancias sin género: para compartir, coleccionar o construir tu propia firma."
      params={params}
      base={{ genero: ['UNISEX'] }}
      bloqueadas={['genero']}
      rutaBase="/unisex"
      imagen="/editorial/coleccion-unisex.jpg"
    />
  );
}
