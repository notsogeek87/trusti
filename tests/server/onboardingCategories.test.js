import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchesOnboardingCategories, onboardingSubcategoryParents } from '../../server/onboardingCategories.js';

const MESSAGING_STEP = ['Messagerie', 'Email', 'Visioconférence', 'Communication', 'Téléphone & SMS'];
const FINANCE_STEP = ['Finance', 'Banque & Finance', 'Paiement Mobile'];

test('une étape garde ses catégories exactes', () => {
  assert.equal(matchesOnboardingCategories('Messagerie', MESSAGING_STEP), true);
  assert.equal(matchesOnboardingCategories('Email', MESSAGING_STEP), true);
  assert.equal(matchesOnboardingCategories('Jeux', MESSAGING_STEP), false);
});

test('les sous-catégories des catégories découpées suivent leur parent', () => {
  assert.equal(matchesOnboardingCategories('Messagerie / Équipes & communautés', MESSAGING_STEP), true);
  assert.equal(matchesOnboardingCategories('Téléphone & SMS / Second numéro', MESSAGING_STEP), true);
  assert.equal(matchesOnboardingCategories('Email / Logiciels de messagerie', MESSAGING_STEP), true);
  assert.equal(matchesOnboardingCategories('Streaming Vidéo / Films & séries', ['Streaming Vidéo']), true);
});

test('les autres sous-catégories existantes n\'entrent pas dans l\'onboarding', () => {
  assert.equal(matchesOnboardingCategories('Finance / Crypto', FINANCE_STEP), false);
  assert.deepEqual(onboardingSubcategoryParents(FINANCE_STEP), []);
  // un parent découpé mais non demandé par l'étape
  assert.equal(matchesOnboardingCategories('Messagerie / Enfants', ['Réseaux sociaux']), false);
});
