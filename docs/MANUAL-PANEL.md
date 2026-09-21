# Manual del panel — YLANE PERFUMES

Guía práctica para administrar la tienda. No hace falta saber programar.

**Acceso:** `tudominio.com/admin` con el correo y la contraseña que te entregamos.
Lo primero que deberías hacer es cambiar esa contraseña en **Mi cuenta**.

---

## Por dónde empezar

El **Resumen** te muestra arriba los pendientes en rojo. En orden de importancia:

### 1. Configura tu WhatsApp

**Configuración → Contacto → Número de WhatsApp**

Escríbelo en formato internacional y sin espacios ni signos: `573001234567`.

Mientras esté vacío, los botones de WhatsApp **no aparecen** en la tienda. Lo hicimos así
a propósito: preferimos ocultar el botón antes que dejar uno que no funcione. En cuanto lo
guardes, aparecen el botón flotante, el de cada producto y el del carrito.

### 2. Revisa los precios

**Productos → Precios y stock**

Las 308 referencias del proveedor se publicaron con **su precio sugerido**. Cámbialo
donde quieras: es una tabla para escribir rápido, 50 referencias por página.

- **Precio**: sólo números, sin puntos ni signo de peso. `189000`.
- **Precio anterior**: llénalo **sólo si hay un descuento real**. Tiene que ser mayor que
  el precio. La tienda calcula el porcentaje y muestra la etiqueta de oferta sola.
- **Costo**: lo que te cuesta la referencia (el precio partner del proveedor).
  **Nunca se muestra en la tienda**; sólo sirve para calcular la columna **Margen**.
- **Stock**: si lo dejas vacío, la tienda no muestra disponibilidad y la referencia siempre
  se puede pedir. Si escribes un número, se controla el inventario.

Recuerda pulsar **Guardar cambios de esta página** antes de pasar a la siguiente.

> Una referencia sin precio no se puede agregar al carrito: en su lugar la tienda muestra
> «Precio por confirmar» y un botón para consultarla. Es correcto y es intencional.

### 3. Asigna el género que falta

**Productos → Asignar género**

El archivo del proveedor no dice si un perfume es de hombre, de mujer o unisex. Lo
dedujimos sólo cuando era seguro (el nombre dice «Pour Homme», «Woman»… o el perfume ya
estaba en tu primer Excel con ese género). El resto quedó **sin asignar**.

Una referencia sin género **se vende normalmente** y sale en el catálogo, en su marca y en
el buscador, pero **no aparece en Hombre, Mujer ni Unisex** hasta que se lo pongas.

La pantalla agrupa las referencias por marca: marca las casillas (o la marca entera),
elige el género y pulsa **Asignar**. El Resumen te recuerda cuántas quedan.

### 4. Sube las fotos

**Productos → (busca la referencia) → Imágenes**

Sube el archivo, elige el tipo y pulsa *Agregar imagen*.

- **Principal**: la que se ve en el catálogo y en las tarjetas.
- **Secundaria, Galería, Lifestyle, Notas**: las demás, en la ficha del producto.

Mientras una referencia no tenga foto, se muestra un marcador con la identidad de YLANE.
No es una foto genérica repetida: cada una tiene su propio tono.

### 5. Completa los textos legales

**Contenido → Legal**

Están vacíos a propósito: las políticas, los términos, la privacidad y las condiciones de
cambio las define el negocio, no nosotros. Cada bloque tiene un botón **Cargar estructura
sugerida** que te deja el esqueleto listo para que sólo completes el contenido.

Formato de escritura:

```
## Un título de sección

Un párrafo normal. Deja una línea en blanco entre párrafos.

- Una viñeta
- Otra viñeta
```

Mientras un bloque esté vacío, la página muestra un mensaje honesto invitando a
escribirte, en lugar de texto de relleno.

---

## Trabajo del día a día

### Pedidos

**Pedidos** lista todo lo que entra. Al abrir uno puedes:

- Cambiar el **estado**: pendiente → confirmado → preparando → enviado → entregado.
- Cambiar el **estado del pago**.
- **Escribir al cliente** por WhatsApp con el pedido ya redactado.

> Al marcar un pedido como **confirmado** se descuenta el inventario de las referencias que
> tengan stock definido. Si luego lo cancelas, el inventario se devuelve solo. No se
> descuenta al crear el pedido para que un carrito abandonado no te bloquee unidades.

El cliente puede consultar su pedido en `/pedido` con el número y su teléfono.

### Solicitudes

Los formularios de **mayoristas** y de **contacto** llegan aquí. Puedes responder por
WhatsApp con un clic y marcarlas como atendidas.

### Reseñas

Toda reseña entra como **pendiente** y sólo se publica cuando la apruebas. La tienda nunca
inventa reseñas ni muestra valoraciones que no existan.

### Inventario

Vista rápida de lo que está bajo mínimos o agotado, y el valor del inventario
(stock × precio publicado).

---

## Catálogo

### Editar una referencia

**Productos → (clic en el nombre)**

Los campos están agrupados:

- **Identificación**: código, nombre, género, marca y clasificación.
- **Precio e inventario**: precio, precio anterior, costo (con el margen calculado al lado)
  y stock.
- **Descripción**: la corta sale en las tarjetas; la larga en la ficha.
- **Ficha técnica**: familia olfativa, concentración, presentación, notas, duración, origen.
  **Sólo se muestra en la tienda lo que rellenes.** Deja vacío lo que no tengas confirmado.
- **Buscador de fragancias**: intensidad, personalidad y ocasión. Ver más abajo.
- **SEO**: título y descripción para Google (opcionales; si los dejas vacíos se generan).
- **Visibilidad**: publicado, destacado, best seller, novedad.

### Las banderas de visibilidad

| Bandera | Dónde aparece |
| --- | --- |
| **Publicado** | Si lo apagas, la referencia desaparece de la tienda pero no se borra. |
| **Destacado** | Sección «Selección YLANE» de la portada. Aparece cuando marcas **al menos 4**. |
| **Best seller** | Etiqueta en la tarjeta y colección Best Sellers. Márcalo sólo si de verdad lo es. |
| **Novedad** | Etiqueta «Nuevo» y colección Novedades. |

### Marcas

**Marcas** — las referencias del proveedor traen su marca. Si cambias la **clasificación**
de una marca (por ejemplo, la pasas a «Árabe»), sus referencias la heredan, salvo las que
hayas clasificado a mano de otra forma.

Tres marcas del proveedor quedaron **sin clasificar** porque no lo sabíamos con certeza:
Dumont, Jo Milano e Ilmin. Y hay marcas que el proveedor escribe de dos maneras (Armani /
Giorgio Armani / Emporio Armani, Dior / Miss Dior, Tommy Hilfiger / Tommy Girl): si
quieres unificarlas, selecciona las referencias y asígnales la marca de una sola vez.

### El catálogo del proveedor

En **Productos** puedes filtrar por origen: *del proveedor* (las 308 que se venden) o *del
primer Excel* (las 259 anteriores, ocultas pero no borradas). En cada ficha del proveedor
hay un enlace **Ficha del proveedor ↗**, visible sólo en el panel.

Cuando el proveedor mande una lista nueva, se reimporta sin duplicar y **sin pisar lo que
editaste aquí** (precio publicado, nombre, género, fotos): sólo se actualiza el costo, y
las referencias que el proveedor marque como no disponibles se despublican.

### Categorías

Las categorías se arman con un filtro del catálogo:

| Filtro | Qué agrupa |
| --- | --- |
| `genero:DAMA` | Todas las de mujer |
| `genero:CABALLERO` | Todas las de hombre |
| `genero:UNISEX` | Las unisex |
| `tipo:arabe` | Perfumería árabe |
| `tipo:nicho` | Nicho |
| `flag:destacado` | Las marcadas como destacadas |
| `flag:bestseller` | Las marcadas como best seller |
| `flag:nuevo` | Las marcadas como novedad |

---

## Contenido y promociones

### Banners

**Banners** controla el hero de la portada (título, subtítulo, texto y los dos botones) y
la banda promocional. Si dejas la imagen vacía se usa la composición gráfica de la marca.

### Cupones

**Cupones** — código, porcentaje o monto fijo, compra mínima, límite de usos y fecha de
vencimiento. Se validan en el servidor al finalizar la compra.

Las **ofertas** no son cupones: se crean poniendo un «precio anterior» mayor que el precio
actual en cada referencia.

### El buscador de fragancias

La sección *Descubre tu fragancia* pregunta al cliente para quién busca, qué quiere
transmitir, cuándo lo usará y qué intensidad prefiere.

Para que recomiende bien, rellena en cada referencia (pestaña *Buscador de fragancias*):

- **Intensidad**: `suave`, `media` o `intensa`.
- **Personalidad**: `elegante, seductor, fresco, misterioso, intenso, dulce, sofisticado`.
- **Ocasión**: `dia, noche, cita, trabajo, fiesta, evento`.

Separados por comas. Mientras no haya atributos cargados, el buscador filtra sólo por
género y se lo dice al cliente con honestidad, en vez de recomendar al azar.

---

## Configuración

| Grupo | Qué controla |
| --- | --- |
| **General** | El texto de la barra superior. Vacío = la barra no se muestra. |
| **Contacto** | WhatsApp, teléfono, correo, ciudad, dirección y horario. |
| **Redes** | Instagram, TikTok, Facebook. Sólo aparecen en el pie los que tengan URL. |
| **Envíos** | Costo, envío gratis desde, y la nota que ve el cliente en el checkout. |
| **Pagos** | Qué formas de pago se ofrecen. |
| **Analítica** | IDs de Google Analytics 4 y Meta Pixel. Sin ID no se carga ningún script. |
| **SEO** | Título y descripción del sitio. |

### Sobre el pago online

Aparece desactivado porque todavía no hay pasarela conectada. **No se simula ningún cobro.**
Cuando tengas la cuenta de Wompi o Bold, pásanos las llaves: se cargan como variables de
entorno del servidor (nunca en la base de datos ni en el navegador) y se activa la opción.

Mientras tanto el checkout registra el pedido, te avisa, y el cobro se acuerda contigo.

---

## Preguntas frecuentes

**¿Puedo borrar una referencia?**
Sí, pero es irreversible. Si sólo quieres que deje de verse, apaga *Publicado*.

**¿Qué pasa si me llega un Excel nuevo?**
Nos lo pasas y lo reimportamos. Las referencias se identifican por su código, así que no se
duplican y **no se pierde nada de lo que hayas cargado**: precios, fotos, stock y textos se
mantienen.

**Hay dos referencias con el mismo nombre.**
Es normal: varias líneas tienen versión de hombre y de mujer (CK IN2U, Versace Eros, Light
Blue, Issey Miyake, Scandal). Se conservan las dos, con direcciones distintas.

**Hay dos referencias sin nombre (UNI072 y UNI073).**
Llegaron vacías en el Excel. Las importamos para no perder la referencia, están inactivas y
llevan el código como nombre provisional. Complétalas cuando tengas el dato.

**¿Puedo tener más de un usuario del panel?**
Hoy hay uno. Si necesitas más, se pueden agregar; avísanos.
