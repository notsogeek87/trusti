/**
 * Textes natifs Android (notifications, mise à jour) : chaque langue values-xx doit avoir
 * exactement les mêmes chaînes que le français (values-fr), avec les mêmes paramètres
 * (%1$s, %2$d…). `values` (sans suffixe) est l'anglais, langue par défaut d'Android.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const RES = new URL('../../android/app/src/main/res', import.meta.url).pathname;
const FILE = 'strings_i18n.xml';

function strings(dir) {
  const xml = readFileSync(join(RES, dir, FILE), 'utf-8');
  return new Map([...xml.matchAll(/<string name="([^"]+)">([\s\S]*?)<\/string>/g)].map((m) => [m[1], m[2]]));
}

const params = (text) => (text.match(/%\d+\$[sd]/g) || []).sort().join(' ');
// Une apostrophe ou un guillemet non échappé casse la compilation des ressources Android.
const unescaped = (text) => /(^|[^\\])['"]/.test(text);

const dirs = readdirSync(RES).filter((d) => /^values(-[a-z]{2})?$/.test(d) && existsSync(join(RES, d, FILE)));
const fr = strings('values-fr');

test('android : le français et la langue par défaut (anglais) existent', () => {
  assert.ok(dirs.includes('values-fr'), 'values-fr/strings_i18n.xml manquant');
  assert.ok(dirs.includes('values'), 'values/strings_i18n.xml manquant (anglais par défaut)');
});

for (const dir of dirs.filter((d) => d !== 'values-fr')) {
  test(`android ${dir} : mêmes chaînes et mêmes paramètres que le français`, () => {
    const tr = strings(dir);
    const problems = [];
    for (const [name, text] of fr) {
      if (!tr.has(name)) { problems.push(`manquante : ${name}`); continue; }
      const value = tr.get(name);
      if (!value.trim()) problems.push(`vide : ${name}`);
      if (params(value) !== params(text)) problems.push(`${name} : paramètres ${params(value) || '(aucun)'}, ${params(text) || '(aucun)'} attendus`);
      if (unescaped(value)) problems.push(`${name} : apostrophe ou guillemet non échappé`);
    }
    for (const name of tr.keys()) if (!fr.has(name)) problems.push(`inconnue : ${name}`);
    assert.deepEqual(problems, []);
  });
}
