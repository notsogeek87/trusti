/**
 * Traductions de l'interface : une langue activée (ENABLED_LANGUAGES) doit être complète,
 * et aucune traduction ne doit contenir de clé inconnue ou de variable différente du français.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fr from '../../src/i18n/locales/fr/index.js';
import en from '../../src/i18n/locales/en/index.js';
import de from '../../src/i18n/locales/de/index.js';
import { ENABLED_LANGUAGES, LANGUAGES, DEFAULT_LANGUAGE } from '../../src/i18n/languages.js';
import { t, setLanguageMessages, detectLanguage } from '../../src/i18n/index.js';

const DICTS = { fr, en, de };

function leaves(obj, prefix = '', out = new Map()) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) leaves(v, key, out);
    else out.set(key, v);
  }
  return out;
}

const vars = (v) => JSON.stringify(v).match(/\{\w+\}/g)?.sort().join(' ') || '';
const shape = (v) => (Array.isArray(v) ? `array:${v.length}` : typeof v);

const frLeaves = leaves(fr);

for (const lang of LANGUAGES.filter((l) => l !== DEFAULT_LANGUAGE)) {
  const dict = leaves(DICTS[lang]);

  test(`i18n ${lang} : pas de clé inconnue, mêmes variables et même forme que le français`, () => {
    const problems = [];
    for (const [key, value] of dict) {
      if (!frLeaves.has(key)) { problems.push(`clé inconnue : ${key}`); continue; }
      const ref = frLeaves.get(key);
      if (shape(ref) !== shape(value)) problems.push(`${key} : forme ${shape(value)}, ${shape(ref)} attendue`);
      else if (vars(ref) !== vars(value)) problems.push(`${key} : variables ${vars(value) || '(aucune)'}, ${vars(ref) || '(aucune)'} attendues`);
      if (typeof value === 'string' && !value.trim()) problems.push(`${key} : texte vide`);
    }
    assert.deepEqual(problems, []);
  });

  const missing = [...frLeaves.keys()].filter((k) => !dict.has(k));
  const coverage = Math.round(((frLeaves.size - missing.length) / frLeaves.size) * 1000) / 10;

  if (ENABLED_LANGUAGES.includes(lang)) {
    test(`i18n ${lang} activée : traduction complète`, () => {
      assert.deepEqual(missing, [], `${missing.length} clé(s) à traduire avant d'activer ${lang}`);
    });
  } else {
    test(`i18n ${lang} (non activée) : ${coverage} % traduit`, () => {
      console.log(`  ${lang} : ${frLeaves.size - missing.length}/${frLeaves.size} clés (${coverage} %)`);
    });
  }
}

test('i18n : t() interpole, gère le pluriel et retombe sur le français', async () => {
  await setLanguageMessages('fr');
  assert.equal(t('common.language'), 'Langue');
  assert.equal(t('cle.inexistante'), 'cle.inexistante');
  await setLanguageMessages('de');
  assert.equal(t('common.language'), 'Sprache');
  await setLanguageMessages('fr');
});

test('i18n : détection de la langue (adresse, puis navigateur, sinon français)', () => {
  assert.equal(detectLanguage({ search: '', navigatorLanguages: ['xx-XX'] }).lang, 'fr');
  for (const lang of ENABLED_LANGUAGES) {
    assert.equal(detectLanguage({ search: `?lang=${lang}`, navigatorLanguages: [] }).lang, lang);
  }
  assert.equal(detectLanguage({ search: '?lang=zz', navigatorLanguages: ['fr-FR'] }).lang, 'fr');
});
