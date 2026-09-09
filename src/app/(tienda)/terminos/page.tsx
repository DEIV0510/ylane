import type { Metadata } from 'next';
import { ContentPage } from '@/components/content/ContentPage';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Términos y condiciones',
  description: 'Términos y condiciones de uso de YLANE PERFUMES.',
  alternates: { canonical: '/terminos' },
};

export default function Pagina() {
  return (
    <ContentPage
      clave="terminos"
      titulo="Términos y condiciones"
      eyebrow="Legal"
    />
  );
}
