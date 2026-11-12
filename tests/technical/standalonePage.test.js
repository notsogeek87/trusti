import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveStandalonePage, STANDALONE_PAGES, STANDALONE_URLS } from '../../src/utils/standalonePage.js';

test('sans paramètre : app principale', () => {
  assert.equal(resolveStandalonePage(''), null);
  assert.equal(resolveStandalonePage('?app=signal'), null);
});

test('?organisation ouvre toujours l\'évaluation historique', () => {
  assert.equal(resolveStandalonePage('?organisation'), STANDALONE_PAGES.EVALUATE_ORGANISATION);
  assert.equal(resolveStandalonePage('?organisation&organisations'), STANDALONE_PAGES.EVALUATE_ORGANISATION);
});

test('?organisations ouvre la rubrique, ?creer-organisation la page en préparation', () => {
  assert.equal(resolveStandalonePage('?organisations'), STANDALONE_PAGES.ORGANISATIONS);
  assert.equal(resolveStandalonePage('?creer-organisation'), STANDALONE_PAGES.CREATE_ORGANISATION);
});

test('les adresses des liens se résolvent vers la bonne page', () => {
  const search = (url) => url.slice(url.indexOf('?'));
  assert.equal(resolveStandalonePage(search(STANDALONE_URLS.EVALUATE_ORGANISATION)), STANDALONE_PAGES.EVALUATE_ORGANISATION);
  assert.equal(resolveStandalonePage(search(STANDALONE_URLS.ORGANISATIONS)), STANDALONE_PAGES.ORGANISATIONS);
  assert.equal(resolveStandalonePage(search(STANDALONE_URLS.CREATE_ORGANISATION)), STANDALONE_PAGES.CREATE_ORGANISATION);
});

test('le retour sans historique remonte à la page parente', async () => {
  const { standaloneParentUrl } = await import('../../src/utils/standalonePage.js');
  assert.equal(standaloneParentUrl(STANDALONE_PAGES.EVALUATE_ORGANISATION), STANDALONE_URLS.ORGANISATIONS);
  assert.equal(standaloneParentUrl(STANDALONE_PAGES.CREATE_ORGANISATION), STANDALONE_URLS.ORGANISATIONS);
  assert.equal(standaloneParentUrl(STANDALONE_PAGES.ORGANISATIONS), '/');
  assert.equal(standaloneParentUrl(null), '/');
});
