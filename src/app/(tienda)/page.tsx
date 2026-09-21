import { and, count, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { banners, categories, products } from '@/db/schema';
import { Colecciones, type Coleccion } from '@/components/home/Colecciones';
import { ConfianzaFranja } from '@/components/home/ConfianzaFranja';
import { DescubreTeaser } from '@/components/home/DescubreTeaser';
import { Hero } from '@/components/home/Hero';
import { MayoristasBanda } from '@/components/home/MayoristasBanda';
import { PerfumeriaArabe } from '@/components/home/PerfumeriaArabe';
import { SeleccionYlane } from '@/components/home/SeleccionYlane';
import { ProductGrid } from '@/components/product/ProductGrid';
import { SectionHeader } from '@/components/ui/Bits';
import {
  contarProductos,
  masVistos,
  seleccion,
  unaPorMarca,
  type ProductoVista,
} from '@/lib/catalog';
import { getContenido, parsearTarjetas } from '@/lib/content';

export const revalidate = 120;

/**
 * Portada. Una narrativa, no una pila de carruseles:
 * marca → producto → descubrimiento → confianza → compra.
 * El orden y la intención de cada sección están en docs/DIRECCION-DE-ARTE.md.
 */
export default async function HomePage() {
  const [heroBanner, promoBanner, referencias, colecciones, bloques] = await Promise.all([
    bannerActivo('hero'),
    bannerActivo('promo'),
    contarProductos(),
    categoriasDestacadas(),
    getContenido(['home_intro', 'home_confianza']),
  ]);

  const [destacados, nichoTop, arabeTop, disenadorTop, serieArabe, vistos, firmas, recientes] =
    await Promise.all([
      seleccion({ flag: 'destacado', limite: 3 }),
      unaPorMarca({ tipo: ['nicho'], orden: 'precio-desc' }, 1),
      unaPorMarca({ tipo: ['arabe'], orden: 'precio-desc' }, 1),
      unaPorMarca({ tipo: ['disenador'], orden: 'precio-desc' }, 1),
      unaPorMarca({ tipo: ['arabe'] }, 8),
      masVistos(4),
      unaPorMarca({ tipo: ['disenador'] }, 12),
      seleccion({ orden: 'novedades', limite: 60 }),
    ]);

  // Ninguna referencia se repite entre secciones.
  const usados = new Set<number>();
  // Con `variadas`, además, una sola referencia por marca: cuatro perfumes de la
  // misma casa seguidos se leen como un listado, no como una selección.
  const tomar = (lista: ProductoVista[], cantidad: number, variadas = false) => {
    const marcas = new Set<string>();
    const elegidos: ProductoVista[] = [];
    for (const producto of lista) {
      if (usados.has(producto.id)) continue;
      const marca = producto.marca ?? producto.codigo;
      if (variadas && marcas.has(marca)) continue;
      marcas.add(marca);
      elegidos.push(producto);
      if (elegidos.length === cantidad) break;
    }
    for (const producto of elegidos) usados.add(producto.id);
    return elegidos;
  };

  // La selección la marca el negocio en el panel (Destacado). Mientras no lo
  // haga, se arma con tres estilos distintos: nicho, árabe y diseñador.
  const seleccionYlane = tomar(
    destacados.length >= 3 ? destacados : [...nichoTop, ...arabeTop, ...disenadorTop],
    3,
  );
  const arabes = tomar(serieArabe, 3);

  // «Más buscados» sólo con visitas reales; si todavía no hay datos, la
  // sección se presenta como lo que es: una muestra de firmas de diseñador.
  const buscados = vistos.filter((producto) => !usados.has(producto.id));
  const conDatos = buscados.length >= 4;
  const masBuscados = tomar(conDatos ? buscados : firmas, 4);
  const novedades = tomar(recientes, 4, true);

  const totalArabes = colecciones.find((coleccion) => coleccion.slug === 'arabes')?.total ?? 0;
  const confianza = parsearTarjetas(bloques.home_confianza ?? '');

  return (
    <>
      {/* 01 */}
      <Hero banner={heroBanner} referencias={referencias} />

      {/* 02 */}
      <SeleccionYlane productos={seleccionYlane} />

      {/* 03 */}
      <Colecciones colecciones={colecciones} intro={bloques.home_intro || undefined} />

      {/* 04 */}
      {arabes.length > 0 && (
        <PerfumeriaArabe banner={promoBanner} productos={arabes} total={totalArabes} />
      )}

      {/* 05 */}
      {masBuscados.length >= 4 && (
        <section data-surface="claro" className="section-y">
          <div className="shell">
            {conDatos ? (
              <SectionHeader
                indice="05"
                eyebrow="Más buscados"
                titulo="Lo que más se consulta."
                texto="Las fichas más visitadas del catálogo en este momento."
                enlace="/perfumes"
                enlaceTexto="Ver catálogo"
              />
            ) : (
              <SectionHeader
                indice="05"
                eyebrow="Perfumería de diseñador"
                titulo="Las grandes firmas."
                texto="Fragancias de las casas de diseñador, cada una de una marca distinta."
                enlace="/perfumes?tipo=disenador"
                enlaceTexto="Ver diseñador"
              />
            )}
            <div className="mt-12 lg:mt-16">
              <ProductGrid productos={masBuscados} columnas={4} />
            </div>
          </div>
        </section>
      )}

      {/* 06 */}
      <DescubreTeaser />

      {/* 07 */}
      {novedades.length >= 4 && (
        <section data-surface="claro" className="section-y lg:pb-44">
          <div className="shell">
            <SectionHeader
              indice="07"
              eyebrow="Novedades"
              titulo="Recién llegadas al catálogo."
              enlace="/perfumes?orden=novedades"
              enlaceTexto="Ver novedades"
            />
            <div className="mt-12 lg:mt-16">
              <ProductGrid productos={novedades} columnas={4} escalonada />
            </div>
          </div>
        </section>
      )}

      {/* 08 */}
      <MayoristasBanda referencias={referencias} />

      {/* 09 */}
      <ConfianzaFranja puntos={confianza} />
    </>
  );
}

/* ── Datos de apoyo ─────────────────────────────────────────────── */
async function bannerActivo(ubicacion: 'hero' | 'promo') {
  const banner = await db
    .select()
    .from(banners)
    .where(and(eq(banners.ubicacion, ubicacion), eq(banners.activo, true)))
    .orderBy(banners.orden)
    .get();
  return banner ?? null;
}

const RUTA_CATEGORIA: Record<string, string> = {
  mujer: '/mujer',
  hombre: '/hombre',
  unisex: '/unisex',
  arabes: '/arabes',
  nicho: '/perfumes?tipo=nicho',
  'best-sellers': '/perfumes?flag=bestseller',
};

async function categoriasDestacadas(): Promise<Coleccion[]> {
  const filas = await db
    .select()
    .from(categories)
    .where(and(eq(categories.activa, true), eq(categories.destacadaHome, true)))
    .orderBy(categories.orden)
    .all();

  const conteos = await Promise.all(
    filas.map(async (categoria) => {
      const filtro = categoria.filtro ?? '';
      const condicion = filtro.startsWith('genero:')
        ? eq(products.genero, filtro.slice(7))
        : filtro.startsWith('tipo:')
          ? eq(products.tipo, filtro.slice(5))
          : filtro === 'flag:bestseller'
            ? eq(products.bestseller, true)
            : filtro === 'flag:destacado'
              ? eq(products.destacado, true)
              : filtro === 'flag:nuevo'
                ? eq(products.nuevo, true)
                : sql`1 = 1`;

      const fila = await db
        .select({ total: count() })
        .from(products)
        .where(and(eq(products.activo, true), condicion))
        .get();

      return {
        slug: categoria.slug,
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        imagen: categoria.imagen,
        href: RUTA_CATEGORIA[categoria.slug] ?? `/perfumes?categoria=${categoria.slug}`,
        total: fila?.total ?? 0,
      };
    }),
  );

  // Una colección que lleva a un listado vacío es un enlace roto para el cliente.
  return conteos.filter((categoria) => categoria.total > 0);
}
