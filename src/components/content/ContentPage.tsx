import { getBloque, parsearContenido, type Nodo } from '@/lib/content';
import { getSettings } from '@/lib/settings';
import { whatsappUrl } from '@/lib/whatsapp';
import { EnlaceFlecha, Indice } from '@/components/ui/Bits';
import { ButtonLink, ExternalButton } from '@/components/ui/Button';

/** Ids que ya existen en el layout de la tienda: un título no puede repetirlos. */
const IDS_RESERVADOS = ['contenido', 'menu-movil'];

/** «## Envíos y entregas» → «envios-y-entregas». */
function aAncla(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Ancla de cada título, en el orden de los nodos. Sale sólo del texto, así que
 * es la misma en cada visita y un enlace compartido (/nosotros#como-elegimos)
 * sigue funcionando; los títulos repetidos reciben -2, -3…
 */
function anclasDeTitulos(nodos: Nodo[]): (string | undefined)[] {
  const usadas = new Set(IDS_RESERVADOS);
  return nodos.map((nodo) => {
    if (nodo.tipo !== 'titulo') return undefined;
    const base = aAncla(nodo.texto) || 'seccion';
    let ancla = base;
    for (let n = 2; usadas.has(ancla); n++) ancla = `${base}-${n}`;
    usadas.add(ancla);
    return ancla;
  });
}

const dosCifras = (n: number) => String(n).padStart(2, '0');

export function ContenidoRico({ nodos, numerar = false }: { nodos: Nodo[]; numerar?: boolean }) {
  const anclas = anclasDeTitulos(nodos);
  let seccion = 0;

  return (
    <div className="prose-ylane">
      {nodos.map((nodo, indice) => {
        if (nodo.tipo === 'titulo') {
          seccion += 1;
          return (
            <h2
              key={indice}
              id={anclas[indice]}
              className="scroll-mt-[calc(var(--header-h)+2rem)]"
            >
              {numerar && (
                <span
                  aria-hidden="true"
                  className="mb-3 block text-[0.8125rem] tracking-normal text-[var(--acento)]"
                >
                  {dosCifras(seccion)}
                </span>
              )}
              {nodo.texto}
            </h2>
          );
        }
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
 * Página de contenido editable desde /admin (nosotros, envíos, legales…).
 * Encabezado editorial y una columna de lectura de ~68 caracteres; si el texto
 * tiene varias secciones, un índice lateral fijo en escritorio.
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

  const anclas = anclasDeTitulos(nodos);
  const secciones = nodos.flatMap((nodo, indice) =>
    nodo.tipo === 'titulo' ? [{ id: anclas[indice] as string, texto: nodo.texto }] : [],
  );
  const conIndice = secciones.length >= 2;

  return (
    <div data-surface="claro">
      <header className="shell pb-12 pt-16 lg:pb-20 lg:pt-28">
        {eyebrow && <Indice className="mb-6 lg:mb-8">{eyebrow}</Indice>}
        <h1 className="display-lg max-w-[20ch]">{titulo}</h1>
        {intro && <p className="lead mt-6 lg:mt-8">{intro}</p>}
      </header>

      <div className="shell pb-20 lg:pb-32">
        <div className="border-t border-[var(--surface-line)] pt-12 lg:grid lg:grid-cols-12 lg:gap-x-10 lg:pt-20">
          {conIndice && (
            <nav aria-label="En esta página" className="hidden lg:col-span-3 lg:block">
              <div className="sticky top-[calc(var(--header-h)+2.5rem)]">
                <p className="eyebrow">En esta página</p>
                <ol className="mt-6 border-t border-[var(--surface-line)]">
                  {secciones.map((seccion, indice) => (
                    <li key={seccion.id} className="border-b border-[var(--surface-line)]">
                      <a
                        href={`#${seccion.id}`}
                        className="flex min-h-11 items-baseline gap-4 py-3 leading-snug text-[var(--surface-muted)] transition-colors duration-300 hover:text-[var(--surface-fg)]"
                      >
                        <span
                          aria-hidden="true"
                          className="font-[family-name:var(--font-display)] text-[0.8125rem] tabular-nums text-[var(--acento)]"
                        >
                          {dosCifras(indice + 1)}
                        </span>
                        <span>{seccion.texto}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </nav>
          )}

          <article className="max-w-[68ch] lg:col-span-8 lg:col-start-5">
            {nodos.length > 0 ? (
              <ContenidoRico nodos={nodos} numerar={conIndice} />
            ) : (
              <div>
                <p className="display-md">Estamos terminando de publicar esta información.</p>
                <p className="mt-5 max-w-[34rem] text-[var(--surface-muted)]">
                  Mientras tanto, escríbenos y te la damos de primera mano. Preferimos decírtelo
                  directamente antes que publicar algo que todavía no está definido.
                </p>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
                  {wa ? (
                    <>
                      <ExternalButton href={wa} target="_blank" tamano="lg" className="w-full sm:w-auto">
                        Escribir por WhatsApp
                      </ExternalButton>
                      <EnlaceFlecha href="/contacto" className="self-start sm:self-auto">
                        Ir a contacto
                      </EnlaceFlecha>
                    </>
                  ) : (
                    <ButtonLink href="/contacto" tamano="lg" className="w-full sm:w-auto">
                      Ir a contacto
                    </ButtonLink>
                  )}
                </div>
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
