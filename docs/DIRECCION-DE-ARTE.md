# Dirección de arte — YLANE PERFUMES

> Una boutique digital de perfumería, no una plantilla de e-commerce.
> Menos elementos, mejor elegidos. Cada sección tiene una razón para existir.

Este documento es la referencia para cualquier cambio visual. Antes de añadir
una sección, una etiqueta o un botón, pregúntate si aporta a la marca o a la
compra. Si no, no va.

---

## 1. Tres ideas que definen la casa

1. **Ritmo de superficies.** La página alterna **negro**, **marfil** y **vino**
   (y **lino**, un marfil más profundo). Nunca más de dos secciones seguidas con
   el mismo fondo. El negro es la noche de la marca; el marfil, la tienda; el
   vino, la especialidad (perfumería árabe).
2. **Composición editorial.** Rejilla de 12 columnas, asimétrica. En cada
   sección hay **un protagonista** (una foto, un producto o un titular) y lo
   demás lo acompaña. Dos secciones seguidas nunca repiten la misma composición.
3. **El producto sobre un escenario claro.** Toda imagen de producto se apoya en
   el *escenario* (`.stage`, un marfil/lino). Las fotos de producto con fondo
   blanco se funden con `mix-blend-multiply`; las referencias sin foto muestran
   una **etiqueta tipográfica** (marca, nombre, concentración, referencia), nunca
   un frasco inventado ni un frasco con «YLANE» impreso: YLANE distribuye, no fabrica.

## 2. Tokens

| Token | Valor | Uso |
| --- | --- | --- |
| `noir` | `#090909` | Fondo nocturno: hero, cabecera, mayoristas, pie. |
| `marfil` | `#F4EFE8` | Fondo de tienda: selección, colecciones, rejillas. |
| `lino` | `#EBE4D8` | Marfil profundo: escenario de producto, bandas suaves. |
| `vino-dark` | `#3A0710` | Superficie vino (perfumería árabe). |
| `vino` | `#5A101C` | Botón principal, acento sobre claro. |
| `champagne` | `#C7A66A` | **Sólo acento** sobre oscuro (índices, hilos, foco). Nunca texto sobre marfil. |
| `tinta` | `#1A1416` | Texto sobre superficies claras. |
| `gris` | `#77716E` | Apoyo. |

Superficies (`data-surface`): `oscuro` · `claro` (marfil) · `lino` · `vino`.
Cada una define `--surface-fg`, `--surface-muted`, `--surface-line`,
`--acento`, `--foco` y `--stage`. Usa siempre esas variables, no colores fijos,
para que el mismo componente funcione en cualquier fondo.

## 3. Tipografía (dos familias, ni una más)

- **Bodoni Moda** (`--font-display`): titulares, hero, campañas, números de
  índice. Peso 400. Cursiva para una palabra de énfasis, nunca para párrafos.
- **Jost** (`--font-sans`): productos, precios, botones, información, formularios.

| Utilidad | Uso |
| --- | --- |
| `display-hero` | Sólo el titular del hero. |
| `display-xl` | Títulos de página de campaña (mayoristas, descubre). |
| `display-lg` | Título de sección (h2). |
| `display-md` | Subtítulos, h3 editoriales. |
| `lead` | Texto de apoyo de sección (17 px, gris de la superficie, 34rem máx.). |
| `indice` / `<Indice numero="02">` | Número + hilo + etiqueta en versalitas. |
| `eyebrow` | Etiqueta pequeña en versalitas sin número. |

Nombres de producto en **Jost**, no en Bodoni. Texto de cuerpo 16 px en móvil.

## 4. Espacio

- Contenedor: `.shell` (máx. 88rem, márgenes 20 / 40 / 64 px).
- Secciones: `.section-y` (80 px móvil, 128 px escritorio). No lo reduzcas para
  «meter más»: si no cabe, sobra algo.
- Rejillas de producto: huecos amplios (`gap-y-12` mínimo). 3 columnas en el
  catálogo, 4 en secciones cortas, 2 en móvil.

## 5. Componentes base (no se duplican: se reutilizan)

- **`<ProductCard>`**: escenario 4:5, marca pequeña, nombre (Jost), precio y
  **una** acción. Máximo una etiqueta (Agotado › −% › Nuevo). La acción aparece
  al pasar el ratón (escritorio) y como botón «+» discreto en táctil.
  `tamano="grande"` para la pieza protagonista de una composición.
- **`<ProductPlaceholder>`**: la etiqueta tipográfica. `compacto` para miniaturas.
- **`<ProductGrid columnas={3|4} escalonada>`**: rejilla con revelado.
- **`<SectionHeader indice eyebrow titulo texto enlace>`**, **`<Indice>`**,
  **`<EnlaceFlecha>`** (acción secundaria), **`<Button>` / `<ButtonLink>`**
  (`principal`, `claro`, `contorno`, `texto`).
- **`<Logo variante="lockup|wordmark|completo|monograma" tono="oro|vino">`**:
  el logo real (PNG dorado). Dorado sólo sobre negro o vino.

## 6. Fotografía

Serie en `public/editorial/` (Unsplash y Pexels, licencias de uso comercial sin
atribución obligatoria; créditos en `docs/CREDITOS-FOTOGRAFIA.md`). Dirección:
fondos oscuros, vino, mármol, vidrio, sombras, luz lateral. Etalonaje cálido y
contenido. **Ninguna foto muestra una marca real**: la etiqueta del frasco del
hero se dejó en blanco.

Las fotos de producto (las que suba el negocio) se muestran **fieles**: sin
recortes creativos, sin filtros, sin tocar etiquetas ni frascos (`object-contain`).

## 7. Movimiento

Sutil y con sentido: revelado al entrar (`data-reveal`, 0,8 s), zoom mínimo en
la foto al pasar el ratón (≤ 1,03), cambio a la segunda foto del producto,
transiciones de 300–500 ms con `--ease-silk`. Nada que gire, vuele o rebote.
Todo respeta `prefers-reduced-motion`. El cargador dura menos de un segundo y
sólo aparece una vez por sesión.

## 8. Narrativa de la portada

| # | Sección | Superficie | Composición |
| --- | --- | --- | --- |
| 01 | Hero | negro | Foto a sangre a la derecha (≈58 %), titular abajo a la izquierda. |
| 02 | Selección YLANE | marfil | 1 producto protagonista (≈50 %) + 2 secundarios. |
| 03 | Colecciones | lino | Mosaico de tamaños distintos: Árabes protagonista. |
| 04 | Perfumería árabe | vino | Foto editorial + titular + 3 referencias en serie (I, II, III). |
| 05 | Más buscados | marfil | Rejilla de 4. Sólo con datos reales de visitas; si no, «Las grandes firmas». |
| 06 | Descubre tu fragancia | negro | Tipográfica e interactiva: la primera pregunta ya se responde aquí. |
| 07 | Novedades | marfil | Rejilla escalonada de 4. |
| 08 | Mayoristas | negro | B2B sobrio: ficha técnica de la distribución + foto. |
| 09 | Confianza | lino | Franja fina de 4 puntos con iconos de línea. |
| 10 | Pie | negro | Logo, lema, enlaces esenciales, legal. |

## 9. Lo que no se hace

- Tarjetas idénticas en fila con botón «Agregar al carrito» en cada una.
- Carruseles horizontales que cortan productos en el borde.
- Más de una etiqueta por producto, o etiquetas redundantes («Árabe» dentro de la sección árabe).
- Emojis como iconos. Iconos de trazo fino (1,4–1,5 px), una sola familia.
- Champagne como color de texto sobre marfil.
- Afirmaciones que el negocio no ha confirmado: «más vendidos» sin ventas,
  «100 % original», «envío gratis», reseñas o valoraciones que no existen.
