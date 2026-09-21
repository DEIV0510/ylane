'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { useCarrito } from '@/components/cart/CartProvider';
import { useConfig } from '@/components/ConfigProvider';
import { SearchOverlay } from '@/components/search/SearchOverlay';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { whatsappUrl } from '@/lib/whatsapp';

/** Navegación principal: corta a propósito. El resto vive en el menú y el pie. */
export const NAV = [
  { href: '/perfumes', etiqueta: 'Perfumes' },
  { href: '/arabes', etiqueta: 'Árabes' },
  { href: '/hombre', etiqueta: 'Hombre' },
  { href: '/mujer', etiqueta: 'Mujer' },
  { href: '/unisex', etiqueta: 'Unisex' },
  { href: '/marcas', etiqueta: 'Marcas' },
];

const SECUNDARIOS = [
  { href: '/descubre', etiqueta: 'Descubrir mi perfume' },
  { href: '/mayoristas', etiqueta: 'Mayoristas' },
  { href: '/ofertas', etiqueta: 'Ofertas' },
  { href: '/pedido', etiqueta: 'Mi pedido' },
  { href: '/contacto', etiqueta: 'Contacto' },
];

export function SiteHeader({ anuncio }: { anuncio: string }) {
  const ruta = usePathname();
  const { unidades, abrir, hidratado } = useCarrito();
  const { whatsapp } = useConfig();
  const [desplazado, setDesplazado] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [buscadorAbierto, setBuscadorAbierto] = useState(false);
  const cabecera = useRef<HTMLDivElement>(null);
  useFocusTrap(cabecera, menuAbierto);

  const esPortada = ruta === '/';
  // Sobre el hero de la portada la cabecera es transparente; al bajar, sólida y compacta.
  const transparente = esPortada && !desplazado && !menuAbierto;
  const compacta = desplazado && !menuAbierto;

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
    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setMenuAbierto(false);
    };
    document.addEventListener('keydown', alPulsar);
    return () => {
      document.body.style.overflow = anterior;
      document.removeEventListener('keydown', alPulsar);
    };
  }, [menuAbierto]);

  // «/» abre el buscador desde cualquier parte (salvo mientras se escribe).
  useEffect(() => {
    const alPulsar = (evento: KeyboardEvent) => {
      if (evento.key !== '/' || evento.metaKey || evento.ctrlKey || evento.altKey) return;
      const destino = evento.target as HTMLElement | null;
      if (destino?.closest('input, textarea, select, [contenteditable="true"]')) return;
      evento.preventDefault();
      setBuscadorAbierto(true);
    };
    document.addEventListener('keydown', alPulsar);
    return () => document.removeEventListener('keydown', alPulsar);
  }, []);

  // Estable: el buscador lo usa como dependencia de sus efectos.
  const cerrarBuscador = useCallback(() => setBuscadorAbierto(false), []);
  const abrirBuscador = useCallback(() => {
    setMenuAbierto(false);
    setBuscadorAbierto(true);
  }, []);

  const enlaceWhatsapp = whatsappUrl(whatsapp, 'Hola, quiero información sobre los perfumes de YLANE.');
  const activo = (href: string) => ruta === href || ruta.startsWith(`${href}/`);

  return (
    <>
      <div ref={cabecera} className="fixed inset-x-0 top-0 z-50">
        {anuncio && (
          <div
            className={`overflow-hidden bg-noir transition-[max-height,opacity] duration-500 ease-[var(--ease-silk)] ${
              desplazado ? 'max-h-0 opacity-0' : 'max-h-8 opacity-100'
            }`}
          >
            <p className="shell h-8 truncate border-b border-white/5 text-center text-[0.6rem] uppercase leading-8 tracking-[0.16em] text-marfil/65 sm:text-[0.625rem] sm:tracking-[0.28em]">
              {anuncio}
            </p>
          </div>
        )}

        <header
          className={`relative border-b transition-[background-color,border-color] duration-500 ease-[var(--ease-silk)] ${
            transparente
              ? 'border-transparent bg-transparent'
              : 'border-[var(--surface-line)] bg-noir/92 backdrop-blur-xl'
          }`}
        >
          {/* Velo para leer la navegación sobre la foto del hero. */}
          {transparente && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-[180%] bg-linear-to-b from-noir/75 via-noir/30 to-transparent"
            />
          )}

          <div
            className={`shell relative grid grid-cols-[1fr_auto_1fr] items-center gap-4 transition-[height] duration-500 ease-[var(--ease-silk)] lg:flex lg:gap-8 ${
              compacta ? 'h-[var(--header-h)]' : 'h-[var(--header-alto)]'
            }`}
          >
            <button
              type="button"
              onClick={() => setMenuAbierto((abierto) => !abierto)}
              aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuAbierto}
              aria-controls="menu-movil"
              className="-ml-2.5 flex size-11 items-center justify-center justify-self-start text-marfil lg:hidden"
            >
              <span className="flex w-5 flex-col gap-[6px]" aria-hidden="true">
                <span
                  className={`h-px w-full bg-current transition-transform duration-300 ${
                    menuAbierto ? 'translate-y-[3.5px] rotate-45' : ''
                  }`}
                />
                <span
                  className={`h-px bg-current transition-[transform,width] duration-300 ${
                    menuAbierto ? 'w-full -translate-y-[3.5px] -rotate-45' : 'w-3.5'
                  }`}
                />
              </span>
            </button>

            <Logo
              variante="lockup"
              prioridad
              className={`transition-[height] duration-500 ease-[var(--ease-silk)] ${
                compacta ? 'h-8 lg:h-10' : 'h-10 lg:h-14'
              }`}
            />

            <nav aria-label="Principal" className="hidden lg:flex lg:flex-1 lg:justify-center">
              <ul className="flex items-center gap-6 xl:gap-9">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={activo(item.href) ? 'page' : undefined}
                      className={`relative flex h-11 items-center text-[0.66rem] font-medium uppercase tracking-[0.22em] transition-colors ${
                        activo(item.href) ? 'text-champagne' : 'text-marfil hover:text-champagne'
                      }`}
                    >
                      {item.etiqueta}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-0 bottom-2 h-px origin-left bg-champagne transition-transform duration-500 ease-[var(--ease-silk)] ${
                          activo(item.href) ? 'scale-x-100' : 'scale-x-0'
                        }`}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center justify-self-end text-marfil lg:gap-1">
              <button
                type="button"
                onClick={abrirBuscador}
                aria-label="Buscar perfumes"
                aria-keyshortcuts="/"
                aria-haspopup="dialog"
                aria-expanded={buscadorAbierto}
                className="flex h-11 min-w-11 items-center justify-center gap-3 transition-colors hover:text-champagne xl:border-b xl:border-white/20 xl:px-1 xl:hover:border-champagne/70 xl:min-w-[9.5rem] xl:justify-between"
              >
                <span className="hidden text-[0.66rem] uppercase tracking-[0.22em] text-marfil/75 xl:inline">
                  Buscar
                </span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.6-3.6" />
                </svg>
              </button>

              <Link
                href="/pedido"
                aria-label="Consultar mi pedido"
                className="hidden size-11 items-center justify-center transition-colors hover:text-champagne lg:flex"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                  <circle cx="12" cy="8" r="3.6" />
                  <path d="M4.5 20c1.4-3.6 4.1-5.4 7.5-5.4s6.1 1.8 7.5 5.4" />
                </svg>
              </Link>

              <button
                type="button"
                onClick={abrir}
                aria-label={`Abrir carrito${hidratado && unidades ? `, ${unidades} artículos` : ''}`}
                className="relative -mr-2.5 flex size-11 items-center justify-center transition-colors hover:text-champagne lg:mr-0"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                  <path d="M6 8h12l-1 12H7L6 8z" />
                  <path d="M9.2 8V6.4a2.8 2.8 0 015.6 0V8" />
                </svg>
                {hidratado && unidades > 0 && (
                  <span className="absolute right-0.5 top-1.5 flex min-w-4 items-center justify-center bg-champagne px-1 text-[0.55rem] font-semibold leading-4 text-noir tabular-nums">
                    {unidades}
                  </span>
                )}
              </button>

              <Link
                href="/mayoristas"
                aria-current={activo('/mayoristas') ? 'page' : undefined}
                className="ml-4 hidden h-10 items-center border border-champagne/55 px-4 text-[0.625rem] font-medium uppercase tracking-[0.22em] text-champagne transition-colors hover:bg-champagne hover:text-noir lg:inline-flex"
              >
                Mayoristas
              </Link>
            </div>
          </div>
        </header>

        {/* Menú móvil a pantalla completa. `inert` saca del teclado los enlaces ocultos. */}
        <div
          id="menu-movil"
          inert={!menuAbierto}
          className={`fixed inset-x-0 bottom-0 overflow-y-auto overscroll-contain bg-noir transition-[opacity,transform] duration-500 ease-[var(--ease-silk)] lg:hidden ${
            menuAbierto ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-3 opacity-0'
          }`}
          style={{ top: desplazado ? 'var(--header-alto)' : 'calc(var(--header-alto) + var(--barra-h))' }}
        >
          <nav aria-label="Menú móvil" className="shell flex min-h-full flex-col pb-[max(2rem,env(safe-area-inset-bottom))] pt-6">
            <button
              type="button"
              onClick={abrirBuscador}
              className="flex h-12 items-center justify-between border-b border-[var(--surface-line)] text-left text-[0.95rem] text-marfil/70"
            >
              ¿Qué fragancia estás buscando?
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.6-3.6" />
              </svg>
            </button>

            <ul className="mt-4">
              {NAV.map((item, indice) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={activo(item.href) ? 'page' : undefined}
                    className="flex items-baseline gap-5 border-b border-[var(--surface-line)] py-3.5"
                  >
                    <span className="w-6 font-[family-name:var(--font-display)] text-[0.85rem] text-champagne/70">
                      {String(indice + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`font-[family-name:var(--font-display)] text-[1.85rem] leading-none ${
                        activo(item.href) ? 'italic text-champagne' : 'text-marfil'
                      }`}
                    >
                      {item.etiqueta}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <ul className="mt-8 grid grid-cols-2 gap-x-6">
              {SECUNDARIOS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-11 items-center text-[0.68rem] uppercase tracking-[0.2em] text-marfil/75"
                  >
                    {item.etiqueta}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-auto flex items-end justify-between gap-6 pt-10">
              <p className="font-[family-name:var(--font-display)] text-lg italic text-marfil/60">
                Tu aroma. Tu firma.
              </p>
              {enlaceWhatsapp && (
                <a
                  href={enlaceWhatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-11 items-center text-[0.68rem] uppercase tracking-[0.2em] text-champagne"
                >
                  WhatsApp
                </a>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Las páginas interiores empiezan debajo de la cabecera; la portada, detrás. */}
      {!esPortada && <div aria-hidden="true" className="h-[calc(var(--header-alto)+var(--barra-h))]" />}

      <SearchOverlay abierto={buscadorAbierto} onCerrar={cerrarBuscador} />
    </>
  );
}
