import { Indice } from '@/components/ui/Bits';
import { ButtonLink } from '@/components/ui/Button';

/**
 * 08 — Mayoristas. Composición propia, más sobria: se presenta como una
 * ficha técnica de la distribución (B2B), no como otra promoción.
 * Sólo datos ciertos del catálogo.
 */
export function MayoristasBanda({ referencias }: { referencias: number }) {
  const ficha: [string, string][] = [
    ['Catálogo', `${referencias} referencias`],
    ['Líneas', 'Árabe · Diseñador · Nicho · Comercial'],
    ['Modalidades', 'Detal y por mayor'],
    ['Atención', 'Asesoría directa'],
  ];

  return (
    <section data-surface="oscuro" className="border-t border-[var(--surface-line)] section-y">
      <div className="shell grid gap-y-14 lg:grid-cols-12 lg:gap-x-10">
        <div data-reveal className="lg:col-span-5">
          <Indice numero="08">Mayoristas</Indice>
          <p className="mt-8 text-[0.8rem] uppercase tracking-[0.24em] text-[var(--surface-muted)]">
            ¿Quieres revender perfumes?
          </p>
          <h2 className="display-xl mt-4">YLANE Mayoristas</h2>
          <p className="lead mt-6">Una selección de fragancias para impulsar tu negocio.</p>
          <ButtonLink href="/mayoristas" variante="contorno" tamano="lg" className="mt-9 w-full sm:w-auto">
            Conocer distribución
          </ButtonLink>
        </div>

        <dl data-reveal className="self-end border-t border-[var(--surface-line)] lg:col-span-6 lg:col-start-7">
          {ficha.map(([termino, valor]) => (
            <div
              key={termino}
              className="grid grid-cols-[7.5rem_1fr] items-baseline gap-6 border-b border-[var(--surface-line)] py-5 sm:grid-cols-[10rem_1fr]"
            >
              <dt className="text-[0.625rem] font-medium uppercase tracking-[0.26em] text-champagne">
                {termino}
              </dt>
              <dd className="font-[family-name:var(--font-display)] text-[1.3rem] leading-snug sm:text-[1.6rem]">
                {valor}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
