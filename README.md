# YLANE PERFUMES

> Tu aroma. Tu firma.

Tienda online y panel de administración para **YLANE PERFUMES**, distribuidora y
comercializadora de perfumería árabe, de diseñador, comercial y nicho.

YLANE **no fabrica** fragancias: selecciona, comercializa y distribuye perfumes de
terceros. Todo el contenido del sitio respeta esa distinción.

---

## Puesta en marcha (local)

```bash
npm install
cp .env.example .env.local     # y completa los valores (ver abajo)
npm run db:push                # crea las tablas
npm run db:seed                # carga el catálogo y el usuario administrador
npm run dev                    # http://localhost:5331
```

### Variables de entorno mínimas

| Variable | Para qué |
| --- | --- |
| `DATABASE_URL` | `file:./data/ylane.db` en local. En producción, la URL `libsql://…` de Turso. |
| `DATABASE_AUTH_TOKEN` | Sólo en producción (Turso). |
| `AUTH_SECRET` | Firma las cookies de sesión del panel. Genera uno con el comando de abajo. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Usuario administrador inicial. **Sólo se usan al ejecutar `npm run db:seed`.** |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio (afecta a canónicas, Open Graph y sitemap). |

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Todo lo demás (WhatsApp, redes, envíos, analítica) se configura **desde el panel**, no
desde el código.

---

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en el puerto 5331. |
| `npm run build` / `npm start` | Compilación y arranque de producción. |
| `npm test` | Comprueba que el catálogo de la base sigue siendo fiel al Excel. |
| `npm run db:generate` | Genera el archivo de migración SQL tras cambiar `src/db/schema.ts`. |
| `npm run db:migrate` | **Aplica las migraciones. Es el comando de producción.** |
| `npm run db:push` | Sincroniza el esquema sin migración. **Sólo desarrollo** (ver aviso). |
| `npm run db:seed` | Siembra catálogo, marcas, categorías, textos y admin. Es idempotente. |
| `npm run db:reset` | Borra la base local y la vuelve a crear desde cero. |
| `npm run import:excel` | Reprocesa `data/catalogo-ylane.xlsx` y regenera `data/catalogo.json`. |

> **Nunca uses `db:push` contra la base de producción.** SQLite no sabe añadir
> columnas `NOT NULL` a una tabla existente, así que drizzle-kit la recrea y los
> datos de esa tabla se pierden. Nos pasó en desarrollo con `users`. Para
> cualquier cambio de esquema en producción: `db:generate` → revisar el `.sql`
> generado → `db:migrate`.

---

## El catálogo viene del Excel del negocio

El archivo `data/catalogo-ylane.xlsx` es la fuente de verdad. `npm run import:excel` lo
lee y genera `data/catalogo.json` + un informe en [`docs/IMPORTACION.md`](docs/IMPORTACION.md).

Lo que el importador **sí** hace:

- Conserva **CÓDIGO, GÉNERO y NOMBRE REAL exactamente como están** en el Excel.
- Usa el código como llave única: reimportar una versión nueva **no duplica** referencias.
- Deduce la marca **sólo si aparece literalmente** en el nombre del producto.
- Deduce la clasificación (árabe / nicho / diseñador / comercial) a partir de esa marca.
- Genera una descripción comercial distinta para cada referencia, sin afirmar datos técnicos.
- Detecta y reporta códigos duplicados, nombres vacíos y colisiones de URL.

Lo que **no** hace, por decisión expresa del negocio:

> No inventa precios, stock, disponibilidad, tamaños, concentración, notas olfativas,
> duración, país de origen ni afirmaciones de autenticidad. Esos campos quedan vacíos y
> se completan desde el panel.

### Actualizar el catálogo

1. Reemplaza `data/catalogo-ylane.xlsx` por la versión nueva.
2. `npm run import:excel`
3. `npm run db:seed`

Las referencias existentes se actualizan (nombre, género) y **se respeta todo lo que ya
hayas cargado desde el panel**: precios, stock, imágenes, notas y atributos no se pisan.

---

## Qué falta para que la tienda esté 100 % operativa

Estas cosas dependen de datos que sólo tiene el negocio. Todas se cargan desde `/admin`,
sin tocar código:

| Pendiente | Dónde se carga | Qué pasa mientras tanto |
| --- | --- | --- |
| **Número de WhatsApp** | Configuración → Contacto | Los botones de WhatsApp **no se muestran** (no se dejan enlaces rotos). |
| **Precios** | Productos → Precios y stock | Las fichas muestran “Precio por confirmar” y un botón de consulta. |
| **Fotografías** | Productos → *(cada referencia)* → Imágenes | Se muestra un marcador propio de la marca, no una foto genérica. |
| **Stock** | Productos → Precios y stock | No se muestra disponibilidad ni urgencia. |
| **Textos legales** | Contenido → Legal | La página invita a escribir en vez de mostrar texto inventado. |
| **Envíos** | Configuración → Envíos y Contenido → Envíos | El checkout dice “el envío se coordina contigo”. |
| **Redes sociales** | Configuración → Redes | Los enlaces no aparecen en el pie. |
| **GA4 / Meta Pixel** | Configuración → Analítica | No se carga ningún script de analítica. |
| **Pasarela de pago** | Variables de entorno + Configuración → Pagos | El pago online aparece desactivado y explicado. |

El panel muestra estos pendientes como avisos en el resumen (`/admin`).

---

## Panel de administración

`/admin` — protegido con sesión real, no con una URL oculta.

- Contraseñas con **scrypt** y sal aleatoria (`src/lib/password.ts`).
- Sesión en **cookie httpOnly** firmada con JWT HS256 (`src/lib/session.ts`).
- `src/middleware.ts` filtra en el borde; **cada página y cada acción del panel revalidan
  la sesión contra la base de datos** (`src/lib/auth.ts`), así que ocultar la ruta nunca es
  la única defensa.
- El panel va con `noindex, nofollow` y está excluido en `robots.txt`.

Secciones: resumen, pedidos, clientes, solicitudes, productos, precios y stock, inventario,
marcas, categorías, reseñas, banners, páginas y textos, cupones, configuración y cuenta.

Guía de uso para el cliente: [`docs/MANUAL-PANEL.md`](docs/MANUAL-PANEL.md).

---

## Pagos

La arquitectura está lista pero **ningún cobro se simula**. Mientras no existan llaves
reales, el checkout registra el pedido y el pago se coordina con el cliente.

Para activar Wompi o Bold, define en el servidor:

```bash
PAYMENTS_PROVIDER="wompi"          # o "bold"
NEXT_PUBLIC_WOMPI_PUBLIC_KEY="…"
WOMPI_INTEGRITY_SECRET="…"
WOMPI_EVENTS_SECRET="…"
```

y activa «Pago online» en Configuración → Pagos. Ver `src/lib/payments.ts`.

---

## Despliegue

Pensado para **Vercel + Turso**, sin cambios de código.

1. **Base de datos**

   ```bash
   vercel integration add turso     # o crea la base en turso.tech
   ```

   Copia la URL `libsql://…` y el token a `DATABASE_URL` y `DATABASE_AUTH_TOKEN`.

2. **Variables en Vercel**: `DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `AUTH_SECRET`,
   `NEXT_PUBLIC_SITE_URL`, `BLOB_READ_WRITE_TOKEN` y, si vas a sembrar desde ahí,
   `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

3. **Imágenes**: en Vercel el sistema de archivos es de sólo lectura, así que hace falta
   `BLOB_READ_WRITE_TOKEN` (Vercel Blob) para poder subir fotos desde el panel. Sin él,
   las subidas sólo funcionan en local.

4. **Primera carga**: con las variables de producción apuntando a Turso, ejecuta
   `npm run db:migrate && npm run db:seed` una sola vez. Para cambios de esquema
   posteriores, siempre `db:generate` + `db:migrate` (nunca `db:push`).

5. **Cambia la contraseña del administrador** desde `/admin/cuenta` en cuanto entres.

---

## Arquitectura

```
src/
├── app/
│   ├── (tienda)/          páginas públicas (layout con cabecera, pie, carrito, WhatsApp)
│   ├── admin/(panel)/     panel protegido
│   ├── admin/login/       acceso (fuera del layout del panel)
│   ├── actions/           server actions: publicas · admin · auth
│   ├── api/               buscar · vista · recomendaciones · admin/upload
│   ├── sitemap.ts robots.ts icon.svg
│   └── layout.tsx         fuentes, proveedores, analítica
├── components/            ui · brand · layout · product · cart · checkout · search ·
│                          finder · forms · content · home · admin
├── db/                    schema.ts (Drizzle) · index.ts (cliente libSQL)
├── lib/                   auth · session · password · catalog · finder · settings ·
│                          content · whatsapp · payments · analytics · format · text
└── middleware.ts          filtro de borde para /admin
```

**Datos**: `products`, `product_images`, `product_categories`, `brands`, `categories`,
`orders`, `order_items`, `customers`, `reviews`, `coupons`, `banners`, `content_blocks`,
`settings`, `leads`, `users`.

**Decisiones que conviene conocer**

- Los precios del pedido **se releen de la base de datos** al confirmar: nunca se confía
  en lo que envía el navegador (`src/app/actions/publicas.ts`).
- El inventario se descuenta al marcar el pedido como **confirmado**, no al crearlo, para
  que un carrito abandonado no bloquee unidades reales. Al cancelar se devuelve.
- El buscador usa una columna `buscador` normalizada (minúsculas, sin tildes) que combina
  código, nombre, marca, género y clasificación.
- Las reseñas entran siempre como **pendientes** y sólo se publican tras moderación.
- El “Más vendidos” de la portada se calcula con pedidos reales; si no hay ventas, la
  sección no aparece.
- Las secciones que dependen de datos que aún no existen se ocultan en vez de mostrarse
  vacías o con información inventada.

---

## Documentación

- [`docs/IMPORTACION.md`](docs/IMPORTACION.md) — informe de la importación del Excel:
  qué se dedujo, qué quedó pendiente, marcas detectadas y referencias por revisar.
- [`docs/MANUAL-PANEL.md`](docs/MANUAL-PANEL.md) — guía del panel para el negocio.
