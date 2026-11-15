#!/usr/bin/env node
/**
 * Repère les textes français restés en dur dans l'interface (hors src/i18n).
 * Usage : node scripts/i18n-report.js [--files] [chemin…]
 *   sans option : nombre de lignes suspectes par fichier, puis le total ;
 *   --files     : affiche aussi les lignes.
 *
 * Heuristique : chaîne ou texte JSX contenant une lettre accentuée française ou un mot
 * français courant. Les commentaires, console.* et imports sont ignorés, ainsi que les
 * lignes marquées `i18n-ignore` (valeur technique, pas un texte affiché) et les blocs
 * entre `i18n-ignore-start` et `i18n-ignore-end` (données : noms de catégories, mots-clés…).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const args = process.argv.slice(2);
const showLines = args.includes('--files');
const targets = args.filter((a) => !a.startsWith('--'));
const START = targets.length ? targets.map((t) => join(ROOT, t)) : [join(ROOT, 'src')];

const FRENCH = /[éèêàùûôîçœÉÈÀÇ]|\b(?:les|des|une|vous|votre|vos|pour|avec|sans|dans|sur|est|sont|aucun|aucune|cette|ces|leur|plus|moins|tout|tous|toutes|appli|applis|données|ou|et|le|la|du|au|aux)\b/i;

function walk(p, out = []) {
  const st = statSync(p);
  if (st.isDirectory()) {
    if (/node_modules|[/\\](i18n|models)$/.test(p)) return out;
    for (const f of readdirSync(p)) walk(join(p, f), out);
  } else if (/\.(jsx?|mjs)$/.test(p) && !/\.test\.js$/.test(p)) out.push(p);
  return out;
}

function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, (m) => m.replace(/[^\n]/g, ' '));
}

let total = 0;
const rows = [];
for (const file of START.flatMap((s) => walk(s))) {
  const raw = readFileSync(file, 'utf-8');
  const rawLines = raw.split('\n');
  const lines = stripComments(raw).split('\n');
  const hits = [];
  let ignoring = false;
  lines.forEach((rawLine, i) => {
    let line = rawLine;
    if (/i18n-ignore-start/.test(rawLines[i] || '')) ignoring = true;
    if (/i18n-ignore-end/.test(rawLines[i] || '')) { ignoring = false; return; }
    if (ignoring) return;
    if (/^\s*(import|export \* from)|console\.(log|warn|error|info|debug)|throw new Error/.test(line) || /i18n-ignore/.test(rawLines[i] || '')) return;
    // Classes CSS (« font-sans »…) : pas du texte
    line = line.replace(/className=(?:"[^"]*"|\{`[^`]*`\})/g, '');
    const strings = [
      ...line.matchAll(/'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g),
    ].map((m) => m[1] ?? m[2] ?? m[3]);
    const jsxText = line.replace(/<[^>]*>/g, '\n').split('\n').filter((s) => !/[{}=;()]/.test(s));
    if ([...strings, ...jsxText].some((s) => s && s.trim().length > 1 && FRENCH.test(s) && !/^[\w./-]+$/.test(s.trim()))) {
      hits.push(`${i + 1}: ${line.trim().slice(0, 140)}`);
    }
  });
  if (hits.length) {
    total += hits.length;
    rows.push([relative(ROOT, file), hits]);
  }
}

rows.sort((a, b) => b[1].length - a[1].length);
for (const [file, hits] of rows) {
  console.log(`${String(hits.length).padStart(4)}  ${file}`);
  if (showLines) for (const h of hits) console.log(`        ${h}`);
}
console.log(`\n${total} ligne(s) suspecte(s) dans ${rows.length} fichier(s).`);
