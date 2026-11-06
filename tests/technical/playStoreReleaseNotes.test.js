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
