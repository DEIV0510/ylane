import type { Metadata } from 'next';
import Link from 'next/link';
import { ConsultaPedido } from '@/components/checkout/ConsultaPedido';
import { Indice } from '@/components/ui/Bits';

export const metadata: Metadata = {
  title: 'Consultar mi pedido',
  description: 'Consulta el estado de tu pedido con el número y tu teléfono.',
  robots: { index: false, follow: true },
};

export default function PedidoPage() {
  return (
    <div data-surface="claro">
      <div className="shell section-y">
        <div className="mx-auto max-w-xl">
          <header className="text-center">
            <Indice>Seguimiento</Indice>
            <h1 className="display-lg mt-6">Consultar mi pedido</h1>
            <p className="lead mx-auto mt-6">
              Ingresa el número de pedido que te dimos al confirmar y el teléfono con el que lo
              registraste.
            </p>
          </header>

          <div className="mt-12 lg:mt-16">
            <ConsultaPedido />
          </div>

          {/* Salida para quien no encuentra su número o tiene dudas del pedido. */}
          <p className="mt-12 text-center text-[0.9375rem] text-[var(--surface-muted)]">
            ¿Tienes dudas sobre tu pedido?{' '}
            <Link
              href="/contacto"
              className="inline-flex min-h-11 items-center text-[var(--surface-fg)] underline decoration-[var(--surface-line)] underline-offset-4 transition-colors duration-300 hover:text-[var(--acento)] hover:decoration-current"
            >
              Escríbenos
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
