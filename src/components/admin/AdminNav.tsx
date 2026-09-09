'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cerrarSesion } from '@/app/actions/auth';
import { Monograma } from '@/components/brand/Logo';

const SECCIONES = [
  {
    titulo: 'Tienda',
    items: [
      { href: '/admin', etiqueta: 'Resumen' },
      { href: '/admin/pedidos', etiqueta: 'Pedidos' },
      { href: '/admin/clientes', etiqueta: 'Clientes' },
      { href: '/admin/solicitudes', etiqueta: 'Solicitudes' },
    ],
  },
  {
    titulo: 'Catálogo',
    items: [
      { href: '/admin/productos', etiqueta: 'Productos' },
      { href: '/admin/productos/precios', etiqueta: 'Precios y stock' },
      { href: '/admin/inventario', etiqueta: 'Inventario' },
      { href: '/admin/marcas', etiqueta: 'Marcas' },
      { href: '/admin/categorias', etiqueta: 'Categorías' },
      { href: '/admin/resenas', etiqueta: 'Reseñas' },
    ],
  },
  {
    titulo: 'Contenido',
    items: [
      { href: '/admin/banners', etiqueta: 'Banners' },
      { href: '/admin/contenido', etiqueta: 'Páginas y textos' },
      { href: '/admin/promociones', etiqueta: 'Cupones' },
    ],
  },
  {
    titulo: 'Ajustes',
    items: [
      { href: '/admin/configuracion', etiqueta: 'Configuración' },
      { href: '/admin/cuenta', etiqueta: 'Mi cuenta' },
    ],
  },
];

export function AdminNav({ nombre }: { nombre: string }) {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);

  const enlaces = (
    <nav className="space-y-7">
      {SECCIONES.map((seccion) => (
        <div key={seccion.titulo}>
          <p className="mb-2 text-[0.58rem] uppercase tracking-[0.24em] text-[var(--surface-muted)]">
            {seccion.titulo}
          </p>
          <ul className="space-y-0.5">
            {seccion.items.map((item) => {
              const activo =
                item.href === '/admin' ? ruta === '/admin' : ruta.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setAbierto(false)}
                    className={`block border-l-2 py-1.5 pl-3 text-[0.85rem] transition-colors ${
                      activo
                        ? 'border-vino font-medium text-vino'
                        : 'border-transparent text-[var(--surface-fg)] hover:border-[var(--surface-line)] hover:text-vino'
                    }`}
                  >
                    {item.etiqueta}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Barra superior móvil */}
      <div className="flex items-center justify-between border-b border-[var(--surface-line)] px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setAbierto((valor) => !valor)}
          aria-expanded={abierto}
          className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.16em]"
        >
          <span className="flex w-4 flex-col gap-1" aria-hidden="true">
            <span className="h-px w-full bg-current" />
            <span className="h-px w-full bg-current" />
            <span className="h-px w-full bg-current" />
          </span>
          Menú
        </button>
        <Link href="/" className="text-[0.7rem] uppercase tracking-[0.16em] hover:text-vino">
          Ver tienda ↗
        </Link>
      </div>

      <aside
        className={`border-b border-[var(--surface-line)] px-5 py-6 lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:py-8 ${
          abierto ? 'block' : 'hidden lg:block'
        }`}
      >
        <div className="mb-8 flex items-center gap-3">
          <Monograma className="h-7 w-auto text-vino" />
          <div>
            <p
              className="font-[family-name:var(--font-display)] text-sm tracking-[0.3em]"
              style={{ paddingLeft: '0.3em' }}
            >
              YLANE
            </p>
            <p className="text-[0.58rem] uppercase tracking-[0.2em] text-[var(--surface-muted)]">
              Panel
            </p>
          </div>
        </div>

        {enlaces}

        <div className="mt-10 border-t border-[var(--surface-line)] pt-5">
          <p className="text-[0.72rem] text-[var(--surface-muted)]">Sesión de</p>
          <p className="text-[0.85rem]">{nombre}</p>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/"
              className="hidden text-[0.72rem] uppercase tracking-[0.14em] text-[var(--surface-muted)] transition-colors hover:text-vino lg:block"
            >
              Ver tienda ↗
            </Link>
            <form action={cerrarSesion}>
              <button
                type="submit"
                className="text-[0.72rem] uppercase tracking-[0.14em] text-[var(--surface-muted)] transition-colors hover:text-vino"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
