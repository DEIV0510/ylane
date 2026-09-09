'use client';

import { useActionState } from 'react';
import { cambiarPassword } from '@/app/actions/admin';
import { Aviso, SubmitButton } from './ui';

export function CambiarPassword() {
  const [estado, accion] = useActionState(cambiarPassword, null);

  return (
    <form action={accion} className="space-y-4 border border-[var(--surface-line)] p-5">
      <Entrada nombre="actual" etiqueta="Contraseña actual" autoComplete="current-password" />
      <Entrada
        nombre="nueva"
        etiqueta="Nueva contraseña"
        autoComplete="new-password"
        ayuda="Mínimo 10 caracteres."
      />
      <Entrada nombre="repetida" etiqueta="Repite la nueva contraseña" autoComplete="new-password" />

      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton>Actualizar contraseña</SubmitButton>
        <Aviso estado={estado} />
      </div>
    </form>
  );
}

function Entrada({
  nombre,
  etiqueta,
  autoComplete,
  ayuda,
}: {
  nombre: string;
  etiqueta: string;
  autoComplete: string;
  ayuda?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.62rem] uppercase tracking-[0.18em] text-[var(--surface-muted)]">
        {etiqueta}
      </span>
      <input
        name={nombre}
        type="password"
        required
        autoComplete={autoComplete}
        className="w-full border border-[var(--surface-line)] bg-[var(--surface-card)] px-3 py-2.5 text-sm outline-none focus:border-vino"
      />
      {ayuda && <span className="mt-1 block text-[0.72rem] text-[var(--surface-muted)]">{ayuda}</span>}
    </label>
  );
}
