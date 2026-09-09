/**
 * Arranque del servidor de desarrollo desde una ruta absoluta.
 * Se usa para poder lanzar el proyecto desde otra carpeta de trabajo
 * (el panel de vista previa) sin depender del directorio actual.
 */
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
process.chdir(root);

const next = join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
const hijo = spawn(process.execPath, [next, 'dev', '-p', '5331'], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env },
});

hijo.on('exit', (codigo) => process.exit(codigo ?? 0));
