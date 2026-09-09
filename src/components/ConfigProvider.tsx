'use client';

import { createContext, useContext, type ReactNode } from 'react';

/**
 * Configuración pública de la tienda disponible en cliente.
 * Sólo viaja lo que ya es público (WhatsApp, redes, textos). Ningún secreto.
 */
export type ConfigTienda = {
  whatsapp: string;
  instagram: string;
  tiktok: string;
  facebook: string;
  email: string;
  telefono: string;
  ciudad: string;
  envioCosto: number | null;
  envioGratisDesde: number | null;
  envioNota: string;
  siteUrl: string;
};

const ConfigContext = createContext<ConfigTienda | null>(null);

export function ConfigProvider({ valor, children }: { valor: ConfigTienda; children: ReactNode }) {
  // Sólo contiene datos (ningún callback), así que no hace falta memorizarlo:
  // un cambio de identidad no reinicia nada en los consumidores.
  return <ConfigContext.Provider value={valor}>{children}</ConfigContext.Provider>;
}

export function useConfig(): ConfigTienda {
  const contexto = useContext(ConfigContext);
  if (!contexto) throw new Error('useConfig debe usarse dentro de <ConfigProvider>');
  return contexto;
}
