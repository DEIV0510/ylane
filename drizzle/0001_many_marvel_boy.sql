ALTER TABLE `products` ADD `costo` integer;--> statement-breakpoint
ALTER TABLE `products` ADD `proveedor_ref` text;--> statement-breakpoint
ALTER TABLE `products` ADD `proveedor_url` text;--> statement-breakpoint
CREATE UNIQUE INDEX `products_proveedor_ref_idx` ON `products` (`proveedor_ref`);