import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getMainCategory, getPodiumCategory, SPLIT_SUBCATEGORIES } from '../../src/constants/categories.js';
import { ONBOARDING_SPLIT_PARENTS } from '../../server/onboardingCategories.js';

test('filtre du catalogue : correspondance exacte, puis parent, sinon Divers', () => {
  assert.equal(getMainCategory('Email'), 'Messagerie');
  assert.equal(getMainCategory('Shopping / Mode'), 'Shopping');
  assert.equal(getMainCategory('Streaming Vidéo / Films & séries'), 'Multimédia');
  assert.equal(getMainCategory('Messagerie / Enfants'), 'Messagerie');
  assert.equal(getMainCategory('Sécurité / Bloqueurs de pub'), 'Sécurité & VPN');
  assert.equal(getMainCategory('Personnalisation / Icônes'), 'Divers');
  assert.equal(getMainCategory(null), 'Divers');
});

test('Palmarès : les sous-catégories découpées gardent le podium d\'avant', () => {
  assert.equal(getPodiumCategory('Messagerie / Équipes & communautés'), 'Messagerie');
  assert.equal(getPodiumCategory('Streaming Vidéo / Vidéos en ligne'), 'Streaming Vidéo');
  // les sous-catégories qui existaient déjà gardent leur propre podium
  assert.equal(getPodiumCategory('Productivité / Notes'), 'Productivité / Notes');
  assert.equal(getPodiumCategory('Jeux / Émulation'), 'Jeux / Émulation');
});

test('chaque sous-catégorie découpée suit le format « Parent / Détail »', () => {
  for (const [sub, before] of Object.entries(SPLIT_SUBCATEGORIES)) {
    assert.match(sub, /^[^/]+ \/ [^/]+$/, sub);
    assert.ok(before.length > 0, sub);
  }
});

test('onboarding : chaque parent élargi est bien un parent découpé', () => {
  const splitParents = new Set(Object.keys(SPLIT_SUBCATEGORIES).map(s => s.split(' / ')[0]));
  for (const parent of ONBOARDING_SPLIT_PARENTS) assert.ok(splitParents.has(parent), parent);
});
