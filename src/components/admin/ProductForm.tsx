'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { guardarProducto } from '@/app/actions/admin';
import { AreaTexto, Aviso, Campo, Interruptor, Selector, SubmitButton } from './ui';
import { formatCOP } from '@/lib/format';
import type { Product } from '@/db/schema';

type Marca = { id: number; nombre: string };

const GENEROS = [
  { valor: 'SIN_GENERO', etiqueta: 'Sin asignar (no sale en Hombre/Mujer/Unisex)' },
  { valor: 'DAMA', etiqueta: 'Mujer' },
  { valor: 'CABALLERO', etiqueta: 'Hombre' },
  { valor: 'UNISEX', etiqueta: 'Unisex' },
];

const TIPOS = [
  { valor: '', etiqueta: 'Sin clasificar' },
  { valor: 'arabe', etiqueta: 'Árabe' },
  { valor: 'nicho', etiqueta: 'Nicho' },
  { valor: 'disenador', etiqueta: 'Diseñador' },
  { valor: 'comercial', etiqueta: 'Comercial' },
];

const INTENSIDADES = [
  { valor: '', etiqueta: 'Sin definir' },
  { valor: 'suave', etiqueta: 'Suave' },
  { valor: 'media', etiqueta: 'Media' },
  { valor: 'intensa', etiqueta: 'Intensa' },
];

export function ProductForm({
  producto,
  marcas,
}: {
  producto?: Product;
  marcas: Marca[];
}) {
  const [estado, accion] = useActionState(guardarProducto, null);
  const [precio, setPrecio] = useState(producto?.precio ?? null);
  const [costo, setCosto] = useState(producto?.costo ?? null);
  const margen = precio != null && costo != null ? precio - costo : null;
  const leerNumero = (valor: string) => {
    const limpio = valor.replace(/\D/g, '');
    return limpio ? Number(limpio) : null;
  };

  return (
    <form action={accion} className="space-y-8">
      {producto && <input type="hidden" name="id" value={producto.id} />}

      <Aviso estado={estado} />

      <Bloque titulo="Identificación" descripcion="El código y el nombre vienen del Excel del negocio.">
        <Campo nombre="codigo" etiqueta="Código" valor={producto?.codigo} requerido />
        <Campo nombre="nombre" etiqueta="Nombre" valor={producto?.nombre} requerido className="sm:col-span-2" />
        <Selector nombre="genero" etiqueta="Género" valor={producto?.genero ?? 'SIN_GENERO'} opciones={GENEROS} />
        <Selector
          nombre="marcaId"
          etiqueta="Marca"
          valor={producto?.marcaId ? String(producto.marcaId) : ''}
          opciones={[
            { valor: '', etiqueta: 'Sin marca' },
            ...marcas.map((marca) => ({ valor: String(marca.id), etiqueta: marca.nombre })),
          ]}
        />
        <Selector nombre="tipo" etiqueta="Clasificación" valor={producto?.tipo ?? ''} opciones={TIPOS} />
        {!producto && (
          <Campo
            nombre="slug"
            etiqueta="URL (opcional)"
            ayuda="Si lo dejas vacío se genera desde el nombre."
          />
        )}
      </Bloque>

      <Bloque titulo="Precio e inventario" descripcion="Deja vacío lo que todavía no esté definido: la tienda lo muestra como “por confirmar”.">
        <label className="block">
          <span className="mb-1.5 block text-[0.62rem] uppercase tracking-[0.18em] text-[var(--surface-muted)]">
            Precio publicado (COP)
          </span>
          <input
            name="precio"
            type="number"
            defaultValue={producto?.precio ?? ''}
            onChange={(evento) => setPrecio(leerNumero(evento.target.value))}
            className="w-full border border-[var(--surface-control)] bg-[var(--surface-card)] px-3 py-2.5 text-sm outline-none transition-colors focus:border-vino"
          />
        </label>
        <Campo
          nombre="precioAnterior"
          etiqueta="Precio anterior"
          valor={producto?.precioAnterior}
          tipo="number"
          ayuda="Sólo si hay descuento real."
        />
        <Campo nombre="precioMayorista" etiqueta="Precio mayorista" valor={producto?.precioMayorista} tipo="number" />
        <label className="block">
          <span className="mb-1.5 block text-[0.62rem] uppercase tracking-[0.18em] text-[var(--surface-muted)]">
            Costo (confidencial)
          </span>
          <input
            name="costo"
            type="number"
            defaultValue={producto?.costo ?? ''}
            onChange={(evento) => setCosto(leerNumero(evento.target.value))}
            className="w-full border border-[var(--surface-control)] bg-[var(--surface-card)] px-3 py-2.5 text-sm outline-none transition-colors focus:border-vino"
          />
          <span className="mt-1 block text-[0.7rem] text-[var(--surface-muted)]">
            Lo que pagas al proveedor. Nunca se muestra en la tienda.
          </span>
        </label>
        <div className="flex flex-col justify-center border border-dashed border-[var(--surface-line)] px-3 py-2">
          <span className="text-[0.62rem] uppercase tracking-[0.18em] text-[var(--surface-muted)]">Margen</span>
          <span className={`text-lg ${margen != null && margen < 0 ? 'text-red-700' : ''}`}>
            {margen != null ? formatCOP(margen) : '—'}
          </span>
          {margen != null && precio ? (
            <span className="text-[0.7rem] text-[var(--surface-muted)]">
              {Math.round((margen / precio) * 100)}% sobre el precio publicado
            </span>
          ) : null}
        </div>
        <Campo
          nombre="stock"
          etiqueta="Stock"
          valor={producto?.stock}
          tipo="number"
          ayuda="Vacío = no se controla inventario."
        />
        <Campo nombre="stockMinimo" etiqueta="Stock mínimo" valor={producto?.stockMinimo} tipo="number" />
      </Bloque>

      <Bloque titulo="Descripción">
        <AreaTexto
          nombre="descripcionCorta"
          etiqueta="Descripción corta"
          valor={producto?.descripcionCorta}
          filas={2}
          className="sm:col-span-3"
          ayuda="Se usa en las tarjetas y en los resultados de búsqueda."
        />
        <AreaTexto
          nombre="descripcion"
          etiqueta="Descripción"
          valor={producto?.descripcion}
          filas={5}
          className="sm:col-span-3"
        />
      </Bloque>

      <Bloque
        titulo="Ficha técnica"
        descripcion="Sólo se muestra en la tienda lo que esté diligenciado. No completes datos que no tengas confirmados."
      >
        <Campo nombre="familiaOlfativa" etiqueta="Familia olfativa" valor={producto?.familiaOlfativa} />
        <Campo nombre="concentracion" etiqueta="Concentración" valor={producto?.concentracion} />
        <Campo nombre="presentacion" etiqueta="Presentación" valor={producto?.presentacion} />
        <Campo nombre="notasSalida" etiqueta="Notas de salida" valor={producto?.notasSalida} />
        <Campo nombre="notasCorazon" etiqueta="Notas de corazón" valor={producto?.notasCorazon} />
        <Campo nombre="notasFondo" etiqueta="Notas de fondo" valor={producto?.notasFondo} />
        <Campo nombre="duracion" etiqueta="Duración" valor={producto?.duracion} />
        <Campo nombre="origenPais" etiqueta="País de origen" valor={producto?.origenPais} />
      </Bloque>

      <Bloque
        titulo="Buscador de fragancias"
        descripcion="Estos atributos alimentan la sección “Descubre tu fragancia”. Sepáralos con comas."
      >
        <Selector
          nombre="intensidad"
          etiqueta="Intensidad"
          valor={producto?.intensidad ?? ''}
          opciones={INTENSIDADES}
        />
        <Campo
          nombre="personalidad"
          etiqueta="Personalidad"
          valor={(producto?.personalidad ?? []).join(', ')}
          ayuda="elegante, seductor, fresco, misterioso, intenso, dulce, sofisticado"
          className="sm:col-span-2"
        />
        <Campo
          nombre="ocasion"
          etiqueta="Ocasión"
          valor={(producto?.ocasion ?? []).join(', ')}
          ayuda="dia, noche, cita, trabajo, fiesta, evento"
          className="sm:col-span-2"
        />
        <Campo
          nombre="tags"
          etiqueta="Etiquetas libres"
          valor={(producto?.tags ?? []).join(', ')}
          className="sm:col-span-1"
        />
      </Bloque>

      <Bloque titulo="SEO">
        <Campo nombre="seoTitle" etiqueta="Título SEO" valor={producto?.seoTitle} className="sm:col-span-3" />
        <AreaTexto
          nombre="seoDescription"
          etiqueta="Meta descripción"
          valor={producto?.seoDescription}
          filas={2}
          className="sm:col-span-3"
          ayuda="Máximo recomendado: 160 caracteres."
        />
      </Bloque>

      <Bloque titulo="Visibilidad">
        <div className="sm:col-span-3">
          <Interruptor
            nombre="activo"
            etiqueta="Publicado en la tienda"
            activo={producto?.activo ?? true}
          />
          <Interruptor
            nombre="destacado"
            etiqueta="Destacado (Selección YLANE)"
            activo={producto?.destacado ?? false}
          />
          <Interruptor
            nombre="bestseller"
            etiqueta="Best seller"
            activo={producto?.bestseller ?? false}
            ayuda="Márcalo sólo si de verdad es de los que más vendes."
          />
          <Interruptor nombre="nuevo" etiqueta="Novedad" activo={producto?.nuevo ?? false} />
          <Interruptor
            nombre="requiereRevision"
            etiqueta="Requiere revisión"
            activo={producto?.requiereRevision ?? false}
            ayuda="Marca interna: no se muestra en la tienda."
          />
        </div>
      </Bloque>

      <div className="flex flex-wrap items-center gap-4 border-t border-[var(--surface-line)] pt-6">
        <SubmitButton>{producto ? 'Guardar cambios' : 'Crear referencia'}</SubmitButton>
        <Link
          href="/admin/productos"
          className="text-[0.7rem] uppercase tracking-[0.14em] text-[var(--surface-muted)] hover:text-vino"
        >
          Volver al listado
        </Link>
      </div>
    </form>
  );
}

function Bloque({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-[var(--surface-line)] p-5">
      <h2 className="font-[family-name:var(--font-display)] text-lg">{titulo}</h2>
      {descripcion && (
        <p className="mt-1 text-[0.78rem] text-[var(--surface-muted)]">{descripcion}</p>
      )}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">{children}</div>
    </section>
  );
}
