import { nombreSinMarca } from '@/lib/format';

/**
 * Etiqueta tipográfica para las referencias que todavía no tienen fotografía.
 *
 * No dibuja un frasco: un frasco inventado haría creer que ése es el producto,
 * y uno con «YLANE» impreso sugeriría que YLANE lo fabrica. En su lugar se
 * compone una ficha de perfumería (marca, nombre, concentración, referencia)
 * con la tipografía de la casa. Cuando el negocio sube la foto desde /admin,
 * la etiqueta desaparece sola.
 *
 * Todas las medidas van en `cqw` (ancho del escenario), así la etiqueta se ve
 * igual de proporcionada en una miniatura del buscador que en la ficha.
 */

const CONCENTRACIONES = [
  'extrait de parfum',
  'eau de parfum intense',
  'eau de parfum',
  'eau de toilette',
  'eau de cologne',
  'parfum',
  'edp',
  'edt',
];

/** Quita del final del nombre la concentración, que la etiqueta ya muestra aparte. */
function sinConcentracion(nombre: string, concentracion: string | null | undefined): string {
  if (!concentracion) return nombre;
  const bajo = nombre.toLowerCase();
  for (const candidata of [concentracion.toLowerCase(), ...CONCENTRACIONES]) {
    if (bajo.endsWith(` ${candidata}`)) {
      const resto = nombre.slice(0, nombre.length - candidata.length).trim();
      if (resto.length >= 2) return resto;
    }
  }
  return nombre;
}

const ADORNO: Record<string, string> = {
  arabe: 'text-vino',
  nicho: 'text-tinta',
  disenador: 'text-[#8a6a3a]',
  comercial: 'text-[#8a6a3a]',
};

export function ProductPlaceholder({
  codigo,
  nombre,
  marca,
  tipo,
  concentracion,
  className = '',
  compacto = false,
}: {
  codigo: string;
  nombre?: string;
  marca?: string | null;
  tipo?: string | null;
  concentracion?: string | null;
  className?: string;
  compacto?: boolean;
}) {
  const nombreVisible = nombre ? sinConcentracion(nombreSinMarca(nombre, marca), concentracion) : codigo;
  const etiquetaAccesible = nombre ? `${nombre} — fotografía pendiente` : 'Fotografía pendiente';

  if (compacto) {
    // Miniaturas (buscador, carrito): sólo la inicial de la casa.
    const inicial = (marca ?? nombre ?? codigo).trim().charAt(0).toUpperCase();
    return (
      <div
        role="img"
        aria-label={etiquetaAccesible}
        className={`stage relative flex items-center justify-center overflow-hidden text-tinta ${className}`}
      >
        <span className="absolute inset-[9cqw] border border-tinta/15" aria-hidden="true" />
        <span
          className="font-[family-name:var(--font-display)] text-[46cqw] leading-none text-tinta/70"
          aria-hidden="true"
        >
          {inicial}
        </span>
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={etiquetaAccesible}
      className={`stage relative flex flex-col items-center overflow-hidden text-center text-tinta ${className}`}
    >
      {/* Marco fino, como el de una etiqueta impresa. */}
      <span className="pointer-events-none absolute inset-[5cqw] border border-tinta/12" aria-hidden="true" />

      <span className="relative mt-[15cqw] max-w-[78%] truncate text-[clamp(0.5625rem,3.2cqw,0.78rem)] font-medium uppercase tracking-[0.32em] text-tinta/60">
        {marca ?? 'Perfumería'}
      </span>

      <span className="relative my-auto flex max-w-[80%] flex-col items-center">
        <span className="line-clamp-3 text-balance font-[family-name:var(--font-display)] text-[clamp(1.05rem,9cqw,2.6rem)] italic leading-[1.08] text-tinta/88">
          {nombreVisible}
        </span>
        <span
          className={`mt-[5cqw] flex items-center gap-[2.5cqw] ${ADORNO[tipo ?? ''] ?? 'text-[#8a6a3a]'}`}
          aria-hidden="true"
        >
          <span className="h-px w-[9cqw] bg-current opacity-50" />
          <svg viewBox="0 0 10 10" className="size-[clamp(0.45rem,2.6cqw,0.7rem)]" fill="currentColor">
            <path d="M5 0 L6.1 3.9 L10 5 L6.1 6.1 L5 10 L3.9 6.1 L0 5 L3.9 3.9 Z" />
          </svg>
          <span className="h-px w-[9cqw] bg-current opacity-50" />
        </span>
        {concentracion && (
          <span className="mt-[4cqw] text-[clamp(0.5625rem,3cqw,0.75rem)] uppercase tracking-[0.24em] text-tinta/55">
            {concentracion}
          </span>
        )}
      </span>

      <span className="relative mb-[12cqw] text-[clamp(0.5rem,2.6cqw,0.68rem)] uppercase tracking-[0.3em] text-tinta/40">
        Ref. {codigo}
      </span>
    </div>
  );
}
