/**
 * Configuración de pasarela de pago.
 *
 * La arquitectura está lista, pero NINGÚN cobro se simula: mientras no existan
 * las llaves reales en las variables de entorno, la opción de pago online
 * aparece desactivada y explicada en el checkout.
 *
 * Para activarla:
 *   1. PAYMENTS_PROVIDER="wompi"  (o "bold")
 *   2. Wompi → NEXT_PUBLIC_WOMPI_PUBLIC_KEY, WOMPI_INTEGRITY_SECRET, WOMPI_EVENTS_SECRET
 *      Bold  → NEXT_PUBLIC_BOLD_API_KEY, BOLD_SECRET_KEY
 *   3. Activar "Pago online" en /admin → Configuración → Pagos
 */
export type ProveedorPago = 'wompi' | 'bold' | null;

export function proveedorPago(): ProveedorPago {
  const valor = process.env.PAYMENTS_PROVIDER?.trim().toLowerCase();
  return valor === 'wompi' || valor === 'bold' ? valor : null;
}

export function pagoOnlineDisponible(): boolean {
  const proveedor = proveedorPago();
  if (proveedor === 'wompi') {
    return Boolean(
      process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY?.trim() && process.env.WOMPI_INTEGRITY_SECRET?.trim(),
    );
  }
  if (proveedor === 'bold') {
    return Boolean(process.env.NEXT_PUBLIC_BOLD_API_KEY?.trim() && process.env.BOLD_SECRET_KEY?.trim());
  }
  return false;
}

export type MetodoPago = {
  clave: string;
  etiqueta: string;
  descripcion: string;
  disponible: boolean;
  nota?: string;
};

export function metodosDisponibles(ajustes: Record<string, string>): MetodoPago[] {
  const metodos: MetodoPago[] = [
    {
      clave: 'whatsapp',
      etiqueta: 'Coordinar por WhatsApp',
      descripcion: 'Confirmamos disponibilidad, total y forma de pago contigo antes de despachar.',
      disponible: true,
    },
  ];

  if (ajustes.pago_contraentrega === '1') {
    metodos.push({
      clave: 'contraentrega',
      etiqueta: 'Pago contra entrega',
      descripcion: 'Pagas cuando recibes el pedido.',
      disponible: true,
    });
  }

  if (ajustes.pago_transferencia === '1') {
    metodos.push({
      clave: 'transferencia',
      etiqueta: 'Transferencia / Nequi / Daviplata',
      descripcion:
        ajustes.pago_transferencia_datos?.trim() ||
        'Te enviamos los datos para la transferencia al confirmar el pedido.',
      disponible: true,
    });
  }

  const online = pagoOnlineDisponible() && ajustes.pago_online === '1';
  metodos.push({
    clave: 'online',
    etiqueta: 'Pago online con tarjeta',
    descripcion: online
      ? 'Serás redirigido a la pasarela para completar el pago.'
      : 'Aún no está habilitado en esta tienda.',
    disponible: online,
    nota: online ? undefined : 'Pendiente de activar la pasarela de pago.',
  });

  return metodos;
}
