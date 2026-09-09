/**
 * Marcador de imagen para las referencias que todavía no tienen fotografía.
 *
 * No representa el frasco real de ningún producto: es una silueta abstracta.
 * Cuando el negocio cargue la foto desde /admin, este marcador desaparece.
 * El tono varía según el código, así que dos referencias contiguas no se ven
 * idénticas y el catálogo no parece repetido.
 */
function semilla(texto: string): number {
  let hash = 2166136261;
  for (let i = 0; i < texto.length; i += 1) {
    hash ^= texto.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

const TONOS = [
  ['#1a1013', '#090909'],
  ['#180d12', '#0b0a0b'],
  ['#141018', '#090909'],
  ['#1b1210', '#0a0908'],
  ['#101418', '#090a0b'],
  ['#191014', '#0c0a0b'],
];

export function ProductPlaceholder({
  codigo,
  nombre,
  className = '',
  compacto = false,
}: {
  codigo: string;
  nombre?: string;
  className?: string;
  compacto?: boolean;
}) {
  const s = semilla(codigo);
  const [inicio, fin] = TONOS[s % TONOS.length];
  const id = `ph-${codigo.replace(/[^a-zA-Z0-9]/g, '')}`;
  const desplazamiento = (s % 22) - 11;

  return (
    <svg
      viewBox="0 0 400 500"
      className={className}
      role="img"
      aria-label={nombre ? `${nombre} — imagen pendiente` : 'Imagen pendiente'}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor={inicio} />
          <stop offset="100%" stopColor={fin} />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c7a66a" stopOpacity="0.30" />
          <stop offset="55%" stopColor="#c7a66a" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#c7a66a" stopOpacity="0.18" />
        </linearGradient>
        <radialGradient id={`${id}-halo`} cx="50%" cy="38%" r="58%">
          <stop offset="0%" stopColor="#5a101c" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#5a101c" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="500" fill={`url(#${id}-bg)`} />
      <rect width="400" height="500" fill={`url(#${id}-halo)`} />

      <g transform={`translate(${desplazamiento} 0)`} opacity="0.95">
        {/* Silueta abstracta de flacon */}
        <rect x="168" y="86" width="64" height="44" rx="3" fill={`url(#${id}-glass)`} />
        <rect x="168" y="86" width="64" height="44" rx="3" fill="none" stroke="#c7a66a" strokeOpacity="0.35" />
        <rect x="186" y="130" width="28" height="26" fill="#c7a66a" fillOpacity="0.12" />
        <rect
          x="112"
          y="156"
          width="176"
          height="256"
          rx="10"
          fill={`url(#${id}-glass)`}
          stroke="#c7a66a"
          strokeOpacity="0.38"
        />
        <line x1="146" y1="196" x2="146" y2="376" stroke="#f4efe8" strokeOpacity="0.10" strokeWidth="6" />
        <rect x="150" y="268" width="100" height="46" fill="#090909" fillOpacity="0.35" />
        <text
          x="200"
          y="297"
          textAnchor="middle"
          fill="#c7a66a"
          fillOpacity="0.75"
          fontFamily="var(--font-display), Georgia, serif"
          fontSize="17"
          letterSpacing="5"
        >
          YLANE
        </text>
      </g>

      {!compacto && (
        <text
          x="200"
          y="452"
          textAnchor="middle"
          fill="#f4efe8"
          fillOpacity="0.35"
          fontFamily="var(--font-sans), sans-serif"
          fontSize="13"
          letterSpacing="4"
        >
          {codigo}
        </text>
      )}
    </svg>
  );
}
