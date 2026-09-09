'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Monograma } from '@/components/brand/Logo';
import { useConfig } from '@/components/ConfigProvider';
import { whatsappUrl } from '@/lib/whatsapp';
import { trackEvento } from '@/lib/analytics';

/* ── Pantalla de carga ──────────────────────────────────────────────
   Corta y una sola vez por sesión. Nunca bloquea el contenido: se
   monta encima y se retira sola. Con `prefers-reduced-motion` no aparece. */
export function Loader() {
  const [visible, setVisible] = useState(false);
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let yaVisto = true;
    try {
      yaVisto = window.sessionStorage.getItem('ylane_intro') === '1';
    } catch {
      yaVisto = false;
    }
    if (reduce || yaVisto) return;

    setVisible(true);
    try {
      window.sessionStorage.setItem('ylane_intro', '1');
    } catch {
      /* sin almacenamiento: se mostrará de nuevo, no es un problema */
    }

    const salida = window.setTimeout(() => setSaliendo(true), 780);
    const fin = window.setTimeout(() => setVisible(false), 1320);
    return () => {
      window.clearTimeout(salida);
      window.clearTimeout(fin);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-90 flex flex-col items-center justify-center bg-noir transition-opacity duration-500 ${
        saliendo ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <Monograma className="h-12 w-auto animate-fade-up text-champagne" />
      <p
        className="mt-6 font-[family-name:var(--font-display)] text-xl tracking-[0.45em] text-marfil animate-fade-up"
        style={{ animationDelay: '120ms', paddingLeft: '0.45em' }}
      >
        YLANE
      </p>
      <p
        className="mt-2 text-[0.55rem] uppercase tracking-[0.5em] text-champagne animate-fade-up"
        style={{ animationDelay: '220ms', paddingLeft: '0.5em' }}
      >
        Perfumes
      </p>
      <span className="mt-8 h-px w-24 overflow-hidden bg-white/10">
        <span className="block h-full w-full shimmer" />
      </span>
    </div>
  );
}

/* ── Revelado al hacer scroll ───────────────────────────────────────
   Marca <html> para que el CSS aplique el estado oculto sólo con JS
   activo, y revela todo pasados 2,5 s por si el observador no dispara. */
export function RevealScript() {
  const ruta = usePathname();

  useEffect(() => {
    const raiz = document.documentElement;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    raiz.classList.add('js-ready');

    const elementos = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            entrada.target.classList.add('is-in');
            observador.unobserve(entrada.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );

    for (const elemento of elementos) {
      if (elemento.getBoundingClientRect().top < window.innerHeight) elemento.classList.add('is-in');
      else observador.observe(elemento);
    }

    const seguro = window.setTimeout(() => {
      for (const elemento of elementos) elemento.classList.add('is-in');
    }, 2500);

    return () => {
      observador.disconnect();
      window.clearTimeout(seguro);
    };
  }, [ruta]);

  return null;
}

/* ── Botón flotante de WhatsApp ─────────────────────────────────────
   Sólo aparece si hay número configurado: nunca deja un enlace roto. */
export function WhatsAppButton() {
  const { whatsapp } = useConfig();
  const ruta = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const alDesplazar = () => setVisible(window.scrollY > 320);
    alDesplazar();
    window.addEventListener('scroll', alDesplazar, { passive: true });
    return () => window.removeEventListener('scroll', alDesplazar);
  }, []);

  const url = whatsappUrl(whatsapp, 'Hola, quiero información sobre los perfumes de YLANE.');
  if (!url || ruta.startsWith('/admin')) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvento('Contact', { canal: 'whatsapp', origen: 'flotante' })}
      aria-label="Escríbenos por WhatsApp"
      className={`fixed bottom-5 right-5 z-40 flex size-13 items-center justify-center rounded-full border border-champagne/40 bg-vino text-marfil shadow-[0_10px_40px_-12px_rgba(0,0,0,0.9)] transition-all duration-400 ease-[var(--ease-silk)] hover:bg-vino-glow ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2 22l5.36-1.4a9.8 9.8 0 004.68 1.2h.01c5.43 0 9.84-4.4 9.84-9.84S17.47 2 12.04 2zm0 17.98h-.01a8.2 8.2 0 01-4.16-1.14l-.3-.18-3.18.83.85-3.1-.2-.32a8.13 8.13 0 01-1.25-4.35c0-4.51 3.68-8.18 8.2-8.18 2.19 0 4.25.86 5.8 2.4a8.13 8.13 0 012.4 5.79c0 4.51-3.68 8.18-8.19 8.18zm4.5-6.13c-.25-.12-1.46-.72-1.68-.8-.23-.09-.39-.13-.55.12s-.64.8-.78.97c-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.03s.87 2.35.99 2.51c.12.17 1.71 2.61 4.14 3.66.58.25 1.03.4 1.38.51.58.19 1.11.16 1.53.1.47-.07 1.46-.6 1.66-1.17.21-.58.21-1.07.15-1.17-.06-.11-.22-.17-.47-.29z" />
      </svg>
    </a>
  );
}
