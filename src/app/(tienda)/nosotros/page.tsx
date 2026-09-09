import type { Metadata } from 'next';
import { ContentPage } from '@/components/content/ContentPage';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Nosotros',
  description: 'Conoce YLANE PERFUMES: tienda online y distribuidora de perfumería árabe, de diseñador y nicho.',
  alternates: { canonical: '/nosotros' },
};

export default function Pagina() {
  return (
    <ContentPage
      clave="nosotros"
      titulo="Nosotros"
      eyebrow="YLANE PERFUMES"
      intro="Tienda online y distribuidora de perfumes. No fabricamos fragancias: las seleccionamos y las ponemos a tu alcance."
    />
  );
}
