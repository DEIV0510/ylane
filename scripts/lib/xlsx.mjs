import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/**
 * Lector .xlsx mínimo y sin dependencias.
 * Un .xlsx es un ZIP: se descomprime y se leen sharedStrings.xml + sheet1.xml.
 */

function decodeEntities(value) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&amp;/g, '&');
}

function unzip(xlsxPath) {
  const dir = mkdtempSync(join(tmpdir(), 'ylane-xlsx-'));
  try {
    execFileSync('powershell.exe', [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      `Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('${xlsxPath.replace(/'/g, "''")}','${dir.replace(/'/g, "''")}')`,
    ], { stdio: 'pipe' });
  } catch (error) {
    rmSync(dir, { recursive: true, force: true });
    throw new Error(`No se pudo descomprimir el archivo Excel: ${error.message}`);
  }
  return dir;
}

/** Devuelve las filas del primer sheet como arreglo de objetos { A: '...', B: '...' }. */
export function readSheetRows(xlsxPath) {
  const dir = unzip(xlsxPath);
  try {
    let shared = [];
    try {
      const xml = readFileSync(join(dir, 'xl', 'sharedStrings.xml'), 'utf8');
      shared = [...xml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((match) =>
        [...match[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)]
          .map((t) => decodeEntities(t[1]))
          .join(''),
      );
    } catch {
      shared = [];
    }

    const sheet = readFileSync(join(dir, 'xl', 'worksheets', 'sheet1.xml'), 'utf8');
    const rows = [];
    for (const rowMatch of sheet.matchAll(/<row[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)) {
      const cells = {};
      for (const cellMatch of rowMatch[2].matchAll(
        /<c r="([A-Z]+)\d+"(?:[^>]*?t="([^"]+)")?[^>]*>([\s\S]*?)<\/c>/g,
      )) {
        const [, column, type, body] = cellMatch;
        let value = null;
        if (type === 'inlineStr') {
          const inline = /<t[^>]*>([\s\S]*?)<\/t>/.exec(body);
          value = inline ? decodeEntities(inline[1]) : null;
        } else {
          const raw = /<v>([\s\S]*?)<\/v>/.exec(body);
          if (raw) value = type === 's' ? shared[Number(raw[1])] : decodeEntities(raw[1]);
        }
        if (value != null && value !== '') cells[column] = value;
      }
      rows.push({ row: Number(rowMatch[1]), cells });
    }
    return rows;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

export { require };
