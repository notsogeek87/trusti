import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldOfferPermission, markAsked, markLater, LATER_DELAY_DAYS, MAX_LATER } from '../../src/utils/notificationPermission.js';

const NOW = Date.parse('2026-11-19T12:00:00Z');
const DAY = 24 * 60 * 60 * 1000;
const base = { isNative: true, permission: 'prompt', hasApps: true, anyEnabled: true, state: null, now: NOW };

test('carte proposée sur l\'APK quand Android peut encore demander et que « Mes Apps » est rempli', () => {
  assert.equal(shouldOfferPermission(base), true);
});

test('pas de carte : web, permission déjà accordée ou refusée, aucune app, tout coupé', () => {
  assert.equal(shouldOfferPermission({ ...base, isNative: false }), false);
  assert.equal(shouldOfferPermission({ ...base, permission: 'granted' }), false);
  assert.equal(shouldOfferPermission({ ...base, permission: 'denied' }), false);
  assert.equal(shouldOfferPermission({ ...base, permission: null }), false);
  assert.equal(shouldOfferPermission({ ...base, hasApps: false }), false);
  assert.equal(shouldOfferPermission({ ...base, anyEnabled: false }), false);
});

test('« Activer » : la carte ne revient plus', () => {
  assert.equal(shouldOfferPermission({ ...base, state: markAsked(null) }), false);
});

test('« Plus tard » : revient après le délai, au plus MAX_LATER fois', () => {
  const later = markLater(null, NOW);
  assert.equal(shouldOfferPermission({ ...base, state: later }), false);
  assert.equal(shouldOfferPermission({ ...base, state: later, now: NOW + LATER_DELAY_DAYS * DAY }), true);
  let state = null;
  for (let i = 0; i < MAX_LATER; i++) state = markLater(state, NOW);
  assert.equal(shouldOfferPermission({ ...base, state, now: NOW + 100 * DAY }), false);
});
