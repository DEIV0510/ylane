'use client';

import { useActionState } from 'react';
import { guardarConfiguracion } from '@/app/actions/admin';
import { Aviso, SubmitButton } from './ui';

type Ajuste = {
  clave: string;
  valor: string;
  grupo: string;
  etiqueta: string;
  ayuda: string | null;
  tipo: string;
};

export function FormularioConfiguracion({
  claves,
  grupos,
  titulos,
}: {
  claves: Ajuste[];
  grupos: string[];
  titulos: Record<string, string>;
}) {
  const [estado, accion] = useActionState(guardarConfiguracion, null);

  return (
    <form action={accion} className="space-y-6">
      {grupos.map((grupo) => (
        <section key={grupo} className="border border-[var(--surface-line)] p-5">
          <h2 className="font-[family-name:var(--font-display)] text-lg">
            {titulos[grupo] ?? grupo}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {claves
              .filter((ajuste) => ajuste.grupo === grupo)
              .map((ajuste) => (
                <div
                  key={ajuste.clave}
                  className={ajuste.tipo === 'textarea' ? 'sm:col-span-2' : ''}
                >
                  {ajuste.tipo === 'bool' ? (
                    <label className="flex items-start gap-3 py-1.5">
                      <input
                        type="checkbox"
                        name={ajuste.clave}
                        defaultChecked={ajuste.valor === '1'}
                        className="mt-0.5 size-4 accent-[var(--color-vino)]"
                      />
                      <span>
                        <span className="block text-[0.85rem]">{ajuste.etiqueta}</span>
                        {ajuste.ayuda && (
                          <span className="block text-[0.72rem] text-[var(--surface-muted)]">
                            {ajuste.ayuda}
                          </span>
                        )}
                      </span>
                    </label>
                  ) : (
                    <label className="block">
                      <span className="mb-1.5 block text-[0.62rem] uppercase tracking-[0.18em] text-[var(--surface-muted)]">
                        {ajuste.etiqueta}
                      </span>
                      {ajuste.tipo === 'textarea' ? (
                        <textarea
                          name={ajuste.clave}
                          defaultValue={ajuste.valor}
                          rows={3}
                          className="w-full border border-[var(--surface-line)] bg-[var(--surface-card)] px-3 py-2.5 text-sm outline-none focus:border-vino"
                        />
                      ) : (
                        <input
                          name={ajuste.clave}
                          type={ajuste.tipo === 'number' ? 'number' : 'text'}
                          defaultValue={ajuste.valor}
                          className="w-full border border-[var(--surface-line)] bg-[var(--surface-card)] px-3 py-2.5 text-sm outline-none focus:border-vino"
                        />
                      )}
                      {ajuste.ayuda && (
                        <span className="mt-1 block text-[0.72rem] text-[var(--surface-muted)]">
                          {ajuste.ayuda}
                        </span>
                      )}
                    </label>
                  )}
                </div>
              ))}
          </div>
        </section>
      ))}

      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton>Guardar configuración</SubmitButton>
        <Aviso estado={estado} />
      </div>
    </form>
  );
}
