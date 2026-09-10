CREATE TABLE `banners` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ubicacion` text DEFAULT 'hero' NOT NULL,
	`titulo` text,
	`subtitulo` text,
	`texto` text,
	`cta_texto` text,
	`cta_url` text,
	`cta_secundario_texto` text,
	`cta_secundario_url` text,
	`imagen` text,
	`orden` integer DEFAULT 0 NOT NULL,
	`activo` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `brands` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`nombre` text NOT NULL,
	`descripcion` text,
	`logo` text,
	`origen` text,
	`destacada` integer DEFAULT false NOT NULL,
	`orden` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `brands_slug_unique` ON `brands` (`slug`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`nombre` text NOT NULL,
	`descripcion` text,
	`imagen` text,
	`tipo` text DEFAULT 'coleccion' NOT NULL,
	`filtro` text,
	`orden` integer DEFAULT 0 NOT NULL,
	`activa` integer DEFAULT true NOT NULL,
	`destacada_home` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `content_blocks` (
	`clave` text PRIMARY KEY NOT NULL,
	`titulo` text NOT NULL,
	`descripcion` text,
	`contenido` text DEFAULT '' NOT NULL,
	`grupo` text DEFAULT 'paginas' NOT NULL,
	`actualizado_en` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`codigo` text NOT NULL,
	`descripcion` text,
	`tipo` text DEFAULT 'porcentaje' NOT NULL,
	`valor` real NOT NULL,
	`compra_minima` integer DEFAULT 0,
	`usos_maximos` integer,
	`usos` integer DEFAULT 0 NOT NULL,
	`expira_en` text,
	`activo` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coupons_codigo_unique` ON `coupons` (`codigo`);--> statement-breakpoint
CREATE TABLE `customers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`apellido` text,
	`telefono` text NOT NULL,
	`email` text,
	`departamento` text,
	`ciudad` text,
	`direccion` text,
	`notas` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tipo` text DEFAULT 'mayorista' NOT NULL,
	`nombre` text NOT NULL,
	`empresa` text,
	`telefono` text,
	`email` text,
	`ciudad` text,
	`cantidad` text,
	`mensaje` text,
	`atendido` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`product_id` integer,
	`codigo` text NOT NULL,
	`nombre` text NOT NULL,
	`precio` integer NOT NULL,
	`cantidad` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `order_items_order_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`numero` text NOT NULL,
	`customer_id` integer,
	`nombre` text NOT NULL,
	`apellido` text,
	`telefono` text NOT NULL,
	`email` text,
	`departamento` text,
	`ciudad` text,
	`direccion` text,
	`notas` text,
	`subtotal` integer DEFAULT 0 NOT NULL,
	`envio` integer DEFAULT 0 NOT NULL,
	`descuento` integer DEFAULT 0 NOT NULL,
	`total` integer DEFAULT 0 NOT NULL,
	`cupon` text,
	`metodo_pago` text DEFAULT 'whatsapp' NOT NULL,
	`estado` text DEFAULT 'pendiente' NOT NULL,
	`estado_pago` text DEFAULT 'pendiente' NOT NULL,
	`inventario_descontado` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_numero_unique` ON `orders` (`numero`);--> statement-breakpoint
CREATE INDEX `orders_estado_idx` ON `orders` (`estado`);--> statement-breakpoint
CREATE TABLE `product_categories` (
	`product_id` integer NOT NULL,
	`category_id` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_categories_pk` ON `product_categories` (`product_id`,`category_id`);--> statement-breakpoint
CREATE TABLE `product_images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`url` text NOT NULL,
	`alt` text,
	`tipo` text DEFAULT 'galeria' NOT NULL,
	`orden` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `product_images_product_idx` ON `product_images` (`product_id`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`codigo` text NOT NULL,
	`slug` text NOT NULL,
	`nombre` text NOT NULL,
	`marca_id` integer,
	`genero` text NOT NULL,
	`tipo` text,
	`descripcion` text,
	`descripcion_corta` text,
	`precio` integer,
	`precio_anterior` integer,
	`precio_mayorista` integer,
	`stock` integer,
	`stock_minimo` integer DEFAULT 3,
	`familia_olfativa` text,
	`concentracion` text,
	`presentacion` text,
	`notas_salida` text,
	`notas_corazon` text,
	`notas_fondo` text,
	`duracion` text,
	`origen_pais` text,
	`intensidad` text,
	`ocasion` text DEFAULT '[]',
	`personalidad` text DEFAULT '[]',
	`tags` text DEFAULT '[]',
	`destacado` integer DEFAULT false NOT NULL,
	`bestseller` integer DEFAULT false NOT NULL,
	`nuevo` integer DEFAULT false NOT NULL,
	`activo` integer DEFAULT true NOT NULL,
	`requiere_revision` integer DEFAULT false NOT NULL,
	`seo_title` text,
	`seo_description` text,
	`buscador` text DEFAULT '' NOT NULL,
	`vistas` integer DEFAULT 0 NOT NULL,
	`orden` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`marca_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_codigo_unique` ON `products` (`codigo`);--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
CREATE INDEX `products_genero_idx` ON `products` (`genero`);--> statement-breakpoint
CREATE INDEX `products_marca_idx` ON `products` (`marca_id`);--> statement-breakpoint
CREATE INDEX `products_activo_idx` ON `products` (`activo`);--> statement-breakpoint
CREATE INDEX `products_tipo_idx` ON `products` (`tipo`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`nombre` text NOT NULL,
	`email` text,
	`rating` integer NOT NULL,
	`titulo` text,
	`comentario` text NOT NULL,
	`estado` text DEFAULT 'pendiente' NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `reviews_product_idx` ON `reviews` (`product_id`,`estado`);--> statement-breakpoint
CREATE TABLE `settings` (
	`clave` text PRIMARY KEY NOT NULL,
	`valor` text DEFAULT '' NOT NULL,
	`grupo` text DEFAULT 'general' NOT NULL,
	`etiqueta` text DEFAULT '' NOT NULL,
	`ayuda` text,
	`tipo` text DEFAULT 'text' NOT NULL,
	`orden` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`nombre` text NOT NULL,
	`password_hash` text NOT NULL,
	`rol` text DEFAULT 'admin' NOT NULL,
	`activo` integer DEFAULT true NOT NULL,
	`ultimo_acceso` text,
	`session_version` integer DEFAULT 1 NOT NULL,
	`intentos_fallidos` integer DEFAULT 0 NOT NULL,
	`bloqueado_hasta` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);