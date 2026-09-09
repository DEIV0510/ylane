import type { Metadata } from 'next';
import { ContentPage } from '@/components/content/ContentPage';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Envíos',
  description: 'Información de envíos de YLANE PERFUMES.',
  alternates: { canonical: '/envios' },
};

export default function Pagina() {
  return (
    <ContentPage
      clave="envios"
      titulo="Envíos"
      eyebrow="Información"
      intro="Cómo y cuándo llega tu pedido."
    />
  );
}
