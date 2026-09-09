'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type ItemCarrito = {
  id: number;
  codigo: string;
  slug: string;
  nombre: string;
  marca: string | null;
  precio: number;
  imagen: string | null;
  cantidad: number;
  stock: number | null;
};

type EstadoCarrito = {
  items: ItemCarrito[];
  hidratado: boolean;
  abierto: boolean;
  unidades: number;
  subtotal: number;
  agregar: (item: Omit<ItemCarrito, 'cantidad'>, cantidad?: number) => void;
  quitar: (id: number) => void;
  cambiarCantidad: (id: number, cantidad: number) => void;
  vaciar: () => void;
  abrir: () => void;
  cerrar: () => void;
};

const CarritoContext = createContext<EstadoCarrito | null>(null);
const CLAVE = 'ylane_carrito_v1';
const MAX_UNIDADES = 99;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [hidratado, setHidratado] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const primeraCarga = useRef(true);

  // 1) Se lee el carrito guardado ANTES de permitir cualquier escritura.
  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(CLAVE);
      if (guardado) {
        const datos = JSON.parse(guardado);
        if (Array.isArray(datos)) setItems(datos.filter(esItemValido));
      }
    } catch {
      /* almacenamiento no disponible: el carrito sigue funcionando en memoria */
    }
    setHidratado(true);
  }, []);

  // 2) Sólo se persiste después de hidratar; si no, el primer render vacío
  //    borraría el carrito guardado.
  useEffect(() => {
    if (!hidratado) return;
    if (primeraCarga.current) {
      primeraCarga.current = false;
      return;
    }
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(items));
    } catch {
      /* sin almacenamiento: no se persiste */
    }
  }, [items, hidratado]);

  const agregar = useCallback((item: Omit<ItemCarrito, 'cantidad'>, cantidad = 1) => {
    setItems((actuales) => {
      const existente = actuales.find((linea) => linea.id === item.id);
      if (existente) {
        return actuales.map((linea) =>
          linea.id === item.id
            ? { ...linea, ...item, cantidad: limitar(linea.cantidad + cantidad, item.stock) }
            : linea,
        );
      }
      return [...actuales, { ...item, cantidad: limitar(cantidad, item.stock) }];
    });
    setAbierto(true);
  }, []);

  const quitar = useCallback((id: number) => {
    setItems((actuales) => actuales.filter((linea) => linea.id !== id));
  }, []);

  const cambiarCantidad = useCallback((id: number, cantidad: number) => {
    setItems((actuales) =>
      cantidad <= 0
        ? actuales.filter((linea) => linea.id !== id)
        : actuales.map((linea) =>
            linea.id === id ? { ...linea, cantidad: limitar(cantidad, linea.stock) } : linea,
          ),
    );
  }, []);

  const vaciar = useCallback(() => setItems([]), []);
  const abrir = useCallback(() => setAbierto(true), []);
  const cerrar = useCallback(() => setAbierto(false), []);

  const valor = useMemo<EstadoCarrito>(() => {
    const unidades = items.reduce((total, linea) => total + linea.cantidad, 0);
    const subtotal = items.reduce((total, linea) => total + linea.precio * linea.cantidad, 0);
    return {
      items,
      hidratado,
      abierto,
      unidades,
      subtotal,
      agregar,
      quitar,
      cambiarCantidad,
      vaciar,
      abrir,
      cerrar,
    };
  }, [items, hidratado, abierto, agregar, quitar, cambiarCantidad, vaciar, abrir, cerrar]);

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}

export function useCarrito(): EstadoCarrito {
  const contexto = useContext(CarritoContext);
  if (!contexto) throw new Error('useCarrito debe usarse dentro de <CartProvider>');
  return contexto;
}

function limitar(cantidad: number, stock: number | null): number {
  const tope = stock != null && stock > 0 ? Math.min(stock, MAX_UNIDADES) : MAX_UNIDADES;
  return Math.max(1, Math.min(cantidad, tope));
}

function esItemValido(item: unknown): item is ItemCarrito {
  if (!item || typeof item !== 'object') return false;
  const linea = item as Record<string, unknown>;
  return (
    typeof linea.id === 'number' &&
    typeof linea.nombre === 'string' &&
    typeof linea.precio === 'number' &&
    typeof linea.cantidad === 'number'
  );
}
