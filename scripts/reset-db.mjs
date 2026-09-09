import { rmSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
for (const archivo of ['ylane.db', 'ylane.db-shm', 'ylane.db-wal']) {
  rmSync(join(root, 'data', archivo), { force: true });
}
console.log('· Base de datos local borrada');
