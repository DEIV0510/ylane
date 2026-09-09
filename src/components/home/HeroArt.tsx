/**
 * Composición gráfica del hero y de las tarjetas de categoría.
 * Es arte vectorial propio, no una fotografía de producto: no representa
 * ningún frasco real. Se reemplaza automáticamente cuando el negocio sube
 * una imagen desde /admin → Banners.
 */

export function HeroArt({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 700"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="hero-halo" cx="50%" cy="42%" r="52%">
          <stop offset="0%" stopColor="#7a1a2a" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#5a101c" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#5a101c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hero-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c7a66a" stopOpacity="0.34" />
          <stop offset="45%" stopColor="#f4efe8" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#c7a66a" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id="hero-liquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7a1a2a" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#3a0710" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      <circle cx="260" cy="300" r="250" fill="url(#hero-halo)" />
      <circle cx="260" cy="300" r="188" fill="none" stroke="#c7a66a" strokeOpacity="0.16" />
      <circle cx="260" cy="300" r="232" fill="none" stroke="#c7a66a" strokeOpacity="0.08" />

      {/* Flacon abstracto */}
      <g>
        <rect x="222" y="96" width="76" height="52" rx="2" fill="url(#hero-glass)" />
        <rect x="222" y="96" width="76" height="52" rx="2" fill="none" stroke="#c7a66a" strokeOpacity="0.5" />
        <rect x="244" y="148" width="32" height="34" fill="#c7a66a" fillOpacity="0.14" />
        <rect x="244" y="148" width="32" height="34" fill="none" stroke="#c7a66a" strokeOpacity="0.3" />

        <path
          d="M150 214 Q150 182 186 182 L334 182 Q370 182 370 214 L370 512 Q370 546 336 546 L184 546 Q150 546 150 512 Z"
          fill="url(#hero-glass)"
          stroke="#c7a66a"
          strokeOpacity="0.55"
        />
        <path
          d="M164 350 L356 350 L356 508 Q356 532 332 532 L188 532 Q164 532 164 508 Z"
          fill="url(#hero-liquid)"
        />
        <line x1="190" y1="230" x2="190" y2="500" stroke="#f4efe8" strokeOpacity="0.12" strokeWidth="9" />
        <rect x="196" y="382" width="128" height="66" fill="#090909" fillOpacity="0.4" />
        <text
          x="260"
          y="418"
          textAnchor="middle"
          fill="#c7a66a"
          fontFamily="var(--font-display), Georgia, serif"
          fontSize="21"
          letterSpacing="7"
        >
          YLANE
        </text>
        <text
          x="260"
          y="437"
          textAnchor="middle"
          fill="#f4efe8"
          fillOpacity="0.5"
          fontFamily="var(--font-sans), sans-serif"
          fontSize="8"
          letterSpacing="6"
        >
          PERFUMES
        </text>
      </g>

      <line x1="60" y1="600" x2="460" y2="600" stroke="#c7a66a" strokeOpacity="0.2" />
      <path d="M254 606 L260 612 L266 606 L260 600 Z" fill="#c7a66a" fillOpacity="0.6" />
    </svg>
  );
}

const MOTIVOS: Record<string, { fondo: [string, string]; dibujo: React.ReactNode }> = {
  mujer: {
    fondo: ['#1c1014', '#0b0809'],
    dibujo: (
      <>
        <circle cx="150" cy="140" r="78" fill="none" stroke="#c7a66a" strokeOpacity="0.42" />
        <circle cx="150" cy="140" r="52" fill="#5a101c" fillOpacity="0.35" />
        <path d="M150 62 L150 218" stroke="#c7a66a" strokeOpacity="0.22" />
      </>
    ),
  },
  hombre: {
    fondo: ['#101418', '#08090a'],
    dibujo: (
      <>
        <rect x="88" y="78" width="124" height="124" fill="none" stroke="#c7a66a" strokeOpacity="0.42" />
        <rect x="112" y="102" width="76" height="76" fill="#5a101c" fillOpacity="0.35" />
        <path d="M88 140 L212 140" stroke="#c7a66a" strokeOpacity="0.22" />
      </>
    ),
  },
  unisex: {
    fondo: ['#14121a', '#090909'],
    dibujo: (
      <>
        <circle cx="126" cy="140" r="58" fill="none" stroke="#c7a66a" strokeOpacity="0.42" />
        <circle cx="174" cy="140" r="58" fill="none" stroke="#c7a66a" strokeOpacity="0.42" />
        <circle cx="150" cy="140" r="26" fill="#5a101c" fillOpacity="0.4" />
      </>
    ),
  },
  arabes: {
    fondo: ['#20101a', '#0c0809'],
    dibujo: (
      <>
        <path
          d="M150 64 Q212 64 212 132 L212 216 L88 216 L88 132 Q88 64 150 64 Z"
          fill="#5a101c"
          fillOpacity="0.32"
          stroke="#c7a66a"
          strokeOpacity="0.5"
        />
        <path
          d="M150 96 Q186 96 186 138 L186 216 L114 216 L114 138 Q114 96 150 96 Z"
          fill="none"
          stroke="#c7a66a"
          strokeOpacity="0.28"
        />
        <path d="M150 46 L156 60 L150 74 L144 60 Z" fill="#c7a66a" fillOpacity="0.7" />
      </>
    ),
  },
  nicho: {
    fondo: ['#101613', '#080909'],
    dibujo: (
      <>
        <path d="M150 66 L216 140 L150 214 L84 140 Z" fill="none" stroke="#c7a66a" strokeOpacity="0.45" />
        <path d="M150 100 L182 140 L150 180 L118 140 Z" fill="#5a101c" fillOpacity="0.4" />
      </>
    ),
  },
  'best-sellers': {
    fondo: ['#1a1410', '#0a0908'],
    dibujo: (
      <>
        <path
          d="M150 64 l20 44 48 6 -35 33 9 47 -42 -23 -42 23 9 -47 -35 -33 48 -6z"
          fill="#5a101c"
          fillOpacity="0.35"
          stroke="#c7a66a"
          strokeOpacity="0.48"
        />
      </>
    ),
  },
};

export function CategoryArt({ slug, className = '' }: { slug: string; className?: string }) {
  const motivo = MOTIVOS[slug] ?? MOTIVOS.nicho;
  const id = `cat-${slug}`;
  return (
    <svg viewBox="0 0 300 280" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor={motivo.fondo[0]} />
          <stop offset="100%" stopColor={motivo.fondo[1]} />
        </linearGradient>
      </defs>
      <rect width="300" height="280" fill={`url(#${id})`} />
      {motivo.dibujo}
    </svg>
  );
}
