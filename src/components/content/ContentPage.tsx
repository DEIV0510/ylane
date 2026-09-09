import Link from 'next/link';
import { getBloque, parsearContenido, type Nodo } from '@/lib/content';
import { getSettings } from '@/lib/settings';
import { whatsappUrl } from '@/lib/whatsapp';

export function ContenidoRico({ nodos }: { nodos: Nodo[] }) {
  return (
    <div className="prose-ylane">
      {nodos.map((nodo, indice) => {
        if (nodo.tipo === 'titulo') return <h2 key={indice}>{nodo.texto}</h2>;
        if (nodo.tipo === 'lista') {
          return (
            <ul key={indice}>
              {nodo.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          );
        }
        return <p key={indice}>{nodo.texto}</p>;
      })}
    </div>
  );
}

/**
 * Página de contenido editable desde /admin.
 * Si el bloque todavía está vacío no se inventa nada: se muestra un estado
 * honesto invitando a escribirnos.
 */
export async function ContentPage({
  clave,
  titulo,
  eyebrow,
  intro,
}: {
  clave: string;
  titulo: string;
  eyebrow?: string;
  intro?: string;
}) {
  const [contenido, ajustes] = await Promise.all([getBloque(clave), getSettings()]);
  const nodos = parsearContenido(contenido);
  const wa = whatsappUrl(ajustes.whatsapp, `Hola, tengo una consulta sobre ${titulo.toLowerCase()}.`);

  return (
    <div data-surface="oscuro">
      <header className="border-b border-[var(--surface-line)]">
        <div className="shell py-14 lg:py-20">
          {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
          <h1 className="display-lg">{titulo}</h1>
          {intro && (
            <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-[var(--surface-muted)]">
              {intro}
            </p>
          )}
        </div>
      </header>

      <div className="shell py-14 lg:py-20">
        <div className="max-w-3xl">
          {nodos.length > 0 ? (
            <ContenidoRico nodos={nodos} />
          ) : (
            <div className="border border-[var(--surface-line)] p-8">
              <p className="font-[family-name:var(--font-display)] text-xl">
                Estamos terminando de publicar esta información.
              </p>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-[var(--surface-muted)]">
                Mientras tanto, escríbenos y te la damos de primera mano. Preferimos decírtelo
                directamente antes que publicar algo que todavía no está definido.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-vino bg-vino px-6 py-3 text-[0.68rem] uppercase tracking-[0.18em] text-marfil transition-colors hover:bg-vino-glow"
                  >
                    Escribir por WhatsApp
                  </a>
                )}
                <Link
                  href="/contacto"
                  className="border border-current/35 px-6 py-3 text-[0.68rem] uppercase tracking-[0.18em] transition-colors hover:border-champagne hover:text-champagne"
                >
                  Ir a contacto
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
