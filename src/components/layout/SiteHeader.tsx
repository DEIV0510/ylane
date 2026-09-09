'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { useCarrito } from '@/components/cart/CartProvider';
import { SearchOverlay } from '@/components/search/SearchOverlay';

export const NAV = [
  { href: '/', etiqueta: 'Inicio' },
  { href: '/hombre', etiqueta: 'Hombre' },
  { href: '/mujer', etiqueta: 'Mujer' },
  { href: '/unisex', etiqueta: 'Unisex' },
  { href: '/arabes', etiqueta: 'Árabes' },
  { href: '/marcas', etiqueta: 'Marcas' },
  { href: '/ofertas', etiqueta: 'Ofertas' },
  { href: '/mayoristas', etiqueta: 'Mayoristas' },
];

export function SiteHeader({ anuncio }: { anuncio: string }) {
  const ruta = usePathname();
  const { unidades, abrir, hidratado } = useCarrito();
  const [desplazado, setDesplazado] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [buscadorAbierto, setBuscadorAbierto] = useState(false);

  const esPortada = ruta === '/';

  useEffect(() => {
    const alDesplazar = () => setDesplazado(window.scrollY > 24);
    alDesplazar();
    window.addEventListener('scroll', alDesplazar, { passive: true });
    return () => window.removeEventListener('scroll', alDesplazar);
  }, []);

  useEffect(() => {
    setMenuAbierto(false);
  }, [ruta]);

  useEffect(() => {
    if (!menuAbierto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [menuAbierto]);

  const solido = desplazado || !esPortada || menuAbierto;

  return (
    <>
      {anuncio && (
        <div className="bg-vino-dark text-marfil">
          <p className="shell py-2 text-center text-[0.6rem] uppercase tracking-[0.24em]">{anuncio}</p>
        </div>
      )}

      <header
        className={`sticky top-0 z-50 transition-all duration-500 ease-[var(--ease-silk)] ${
          solido
            ? 'border-b border-[var(--surface-line)] bg-noir/92 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="shell flex h-16 items-center justify-between gap-4 md:h-20">
          <button
            type="button"
            onClick={() => setMenuAbierto((abierto) => !abierto)}
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuAbierto}
            className="-ml-1 flex size-10 items-center justify-center text-marfil lg:hidden"
          >
            <span className="flex w-5 flex-col gap-[5px]">
              <span
                className={`h-px w-full bg-current transition-transform duration-300 ${
                  menuAbierto ? 'translate-y-[6px] rotate-45' : ''
                }`}
              />
              <span
                className={`h-px w-full bg-current transition-opacity duration-200 ${
                  menuAbierto ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`h-px w-full bg-current transition-transform duration-300 ${
                  menuAbierto ? '-translate-y-[6px] -rotate-45' : ''
                }`}
              />
            </span>
          </button>

          <Logo className="text-marfil" />

          <nav aria-label="Principal" className="hidden lg:flex lg:items-center lg:gap-7">
            {NAV.slice(1).map((item) => {
              const activo = ruta === item.href || ruta.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-1 text-[0.66rem] font-medium uppercase tracking-[0.2em] transition-colors ${
                    activo ? 'text-champagne' : 'text-marfil hover:text-champagne'
                  }`}
                >
                  {item.etiqueta}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px bg-champagne transition-all duration-300 ${
                      activo ? 'w-full' : 'w-0'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 text-marfil sm:gap-2">
            <button
              type="button"
              onClick={() => setBuscadorAbierto(true)}
              aria-label="Buscar perfumes"
              className="flex size-10 items-center justify-center transition-colors hover:text-champagne"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.6-3.6" />
              </svg>
            </button>

            <Link
              href="/pedido"
              aria-label="Consultar mi pedido"
              className="flex size-10 items-center justify-center transition-colors hover:text-champagne"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="12" cy="8" r="3.6" />
                <path d="M4.5 20c1.4-3.6 4.1-5.4 7.5-5.4s6.1 1.8 7.5 5.4" />
              </svg>
            </Link>

            <button
              type="button"
              onClick={abrir}
              aria-label={`Abrir carrito${unidades ? `, ${unidades} artículos` : ''}`}
              className="relative flex size-10 items-center justify-center transition-colors hover:text-champagne"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M6 8h12l-1 12H7L6 8z" />
                <path d="M9.2 8V6.4a2.8 2.8 0 015.6 0V8" />
              </svg>
              {hidratado && unidades > 0 && (
                <span className="absolute right-0.5 top-1 flex min-w-4 items-center justify-center bg-champagne px-1 text-[0.55rem] font-semibold leading-4 text-noir">
                  {unidades}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        <div
          className={`overflow-hidden border-t border-[var(--surface-line)] bg-noir transition-[max-height] duration-500 ease-[var(--ease-silk)] lg:hidden ${
            menuAbierto ? 'max-h-[80vh]' : 'max-h-0'
          }`}
        >
          <nav aria-label="Menú móvil" className="shell flex flex-col py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between border-b border-[var(--surface-line)] py-3.5 font-[family-name:var(--font-display)] text-2xl text-marfil last:border-0"
              >
                {item.etiqueta}
                <span aria-hidden="true" className="text-champagne/60">
                  →
                </span>
              </Link>
            ))}
            <Link
              href="/descubre"
              className="mt-4 flex items-center justify-center border border-champagne px-5 py-3 text-[0.66rem] uppercase tracking-[0.2em] text-champagne"
            >
              Descubrir mi fragancia
            </Link>
          </nav>
        </div>
      </header>

      <SearchOverlay abierto={buscadorAbierto} onCerrar={() => setBuscadorAbierto(false)} />
    </>
  );
}
