import type { Metadata } from 'next';
import { ConsultaPedido } from '@/components/checkout/ConsultaPedido';

export const metadata: Metadata = {
  title: 'Consultar mi pedido',
  description: 'Consulta el estado de tu pedido con el número y tu teléfono.',
  robots: { index: false, follow: true },
};

export default function PedidoPage() {
  return (
    <div data-surface="oscuro" className="shell py-14 lg:py-20">
      <div className="mx-auto max-w-xl">
        <p className="eyebrow mb-3">Seguimiento</p>
        <h1 className="display-lg">Consultar mi pedido</h1>
        <p className="mt-4 text-[0.9rem] leading-relaxed text-[var(--surface-muted)]">
          Ingresa el número de pedido que te dimos al confirmar y el teléfono con el que lo
          registraste.
        </p>
        <div className="mt-10">
          <ConsultaPedido />
        </div>
      </div>
    </div>
  );
}
