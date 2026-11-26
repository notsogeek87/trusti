import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Notes « Nouveautés » envoyées au Play Store par tools/publish_play_store.py.
const DIR = join(process.cwd(), 'play-store', 'notes-de-version');

test('notes de version Play Store : fichier fr-FR présent', () => {
  assert.ok(readdirSync(DIR).includes('fr-FR.txt'));
});

test('notes de version Play Store : 500 caractères maximum, nom de langue valide', () => {
  for (const file of readdirSync(DIR).filter(f => f.endsWith('.txt'))) {
    assert.match(file, /^[a-z]{2,3}(-[A-Z]{2})?\.txt$/, file);
    const text = readFileSync(join(DIR, file), 'utf8').trim();
    assert.ok(text.length > 0, `${file} vide`);
    assert.ok([...text].length <= 500, `${file} : ${[...text].length} caractères`);
  }
});

// Fiche traduite (play-store/fiche/README.md) : ajoutée à la fiche Play Store par
// tools/publish_play_store.py pour chaque langue absente. Même découpage que read_listings().
const FICHE = join(process.cwd(), 'play-store', 'fiche', 'README.md');
const LIMITS = [30, 80, 4000];

function listings() {
  const out = {};
  for (const section of readFileSync(FICHE, 'utf8').split('\n## ').slice(1)) {
    const code = section.split('\n', 1)[0].trim();
    if (!/^[a-z]{2,3}-[A-Z]{2}$/.test(code)) continue;
    out[code] = [...section.matchAll(/\*\*[^*]+\*\*\n([\s\S]+?)(?=\n\n\*\*|$)/g)].map(m => m[1].trim());
  }
  return out;
}

test('fiche Play Store : titre 30, description courte 80, complète 4000 caractères maximum', () => {
  for (const [code, blocks] of Object.entries(listings())) {
    assert.equal(blocks.length, 3, `${code} : titre, description courte, description complète attendus`);
    blocks.forEach((b, i) => assert.ok([...b].length <= LIMITS[i], `${code} bloc ${i + 1} : ${[...b].length} caractères`));
  }
});

test('notes de version : chaque langue (hors fr-FR) a sa fiche traduite', () => {
  const codes = Object.keys(listings());
  for (const file of readdirSync(DIR).filter(f => f.endsWith('.txt') && f !== 'fr-FR.txt')) {
    assert.ok(codes.includes(file.replace('.txt', '')), `${file} sans section dans play-store/fiche/README.md`);
  }
});
