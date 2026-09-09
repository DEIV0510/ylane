import type { Metadata } from 'next';
import { ContentPage } from '@/components/content/ContentPage';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Cambios y devoluciones',
  description: 'Condiciones de cambios y devoluciones en YLANE PERFUMES.',
  alternates: { canonical: '/cambios-y-devoluciones' },
};

export default function Pagina() {
  return (
    <ContentPage
      clave="cambios"
      titulo="Cambios y devoluciones"
      eyebrow="Legal"
    />
  );
}
