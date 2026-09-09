'use client';

import { useActionState } from 'react';
import { iniciarSesion } from '@/app/actions/auth';
import { Button } from '@/components/ui/Button';

export function LoginForm({ destino }: { destino?: string }) {
  const [estado, accion, pendiente] = useActionState(iniciarSesion, null);

  return (
    <form action={accion} className="space-y-5 border border-[var(--surface-line)] p-7">
      {destino && <input type="hidden" name="destino" value={destino} />}

      <label className="block">
        <span className="mb-2 block text-[0.62rem] uppercase tracking-[0.2em] text-[var(--surface-muted)]">
          Correo
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          autoFocus
          className="w-full border border-[var(--surface-line)] bg-[var(--surface-input)] px-4 py-3 text-sm outline-none transition-colors focus:border-champagne"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-[0.62rem] uppercase tracking-[0.2em] text-[var(--surface-muted)]">
          Contraseña
        </span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full border border-[var(--surface-line)] bg-[var(--surface-input)] px-4 py-3 text-sm outline-none transition-colors focus:border-champagne"
        />
      </label>

      {estado?.error && <p className="text-sm text-red-300">{estado.error}</p>}

      <Button type="submit" tamano="lg" className="w-full" disabled={pendiente}>
        {pendiente ? 'Entrando…' : 'Entrar'}
      </Button>
    </form>
  );
}
