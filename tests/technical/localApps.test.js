import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isLocalAppId, makeLocalId, cleanAppName, normalizeAppName,
  isValidPackageName, parseLocalApps, findCatalogMatch,
} from '../../src/utils/localApps.js';

const pkgOf = (url) => (url && url.match(/id=([a-zA-Z0-9._]+)/)?.[1]) || null;

test('makeLocalId produit un id local valide et unique', () => {
  const a = makeLocalId();
  const b = makeLocalId();
  assert.ok(isLocalAppId(a));
  assert.notEqual(a, b);
  assert.equal(parseLocalApps([{ id: a, name: 'X' }]).length, 1);
});

test('cleanAppName : espaces, caractères de contrôle, longueur', () => {
  assert.equal(cleanAppName('  A \n\t B  '), 'A B');
  assert.equal(cleanAppName('x'.repeat(200)).length, 80);
  assert.equal(cleanAppName(42), '');
});

test('normalizeAppName ignore casse, accents et ponctuation', () => {
  assert.equal(normalizeAppName('Éléphant-App!'), normalizeAppName('elephant app'));
});

test('isValidPackageName', () => {
  assert.ok(isValidPackageName('org.thoughtcrime.securesms'));
  assert.ok(!isValidPackageName('monapp'));
  assert.ok(!isValidPackageName('a b.c'));
  assert.ok(!isValidPackageName('<script>.x'));
});

test('parseLocalApps : rejette ids invalides, doublons et plafonne', () => {
  const out = parseLocalApps([
    { id: 'local-aaaa1', name: 'A' },
    { id: 'local-aaaa1', name: 'Doublon' },
    { id: '123', name: 'Catalogue' },
    { id: 'local-bbbb2', name: 'B', packageName: 'x' },
    null,
  ]);
  assert.deepEqual(out, [{ id: 'local-aaaa1', name: 'A' }, { id: 'local-bbbb2', name: 'B' }]);
  const many = Array.from({ length: 900 }, (_, i) => ({ id: `local-n${i}xx`, name: `N${i}` }));
  assert.equal(parseLocalApps(many).length, 500);
});

test('findCatalogMatch : package prioritaire, puis nom unique, jamais ambigu', () => {
  const catalog = [
    { id: 1, name: 'Signal', playStoreUrl: 'https://play.google.com/store/apps/details?id=org.thoughtcrime.securesms' },
    { id: 2, name: 'Maps', playStoreUrl: 'https://play.google.com/store/apps/details?id=a.b' },
    { id: 3, name: 'maps', playStoreUrl: 'https://play.google.com/store/apps/details?id=c.d' },
  ];
  assert.equal(findCatalogMatch({ name: 'Autre nom', packageName: 'org.thoughtcrime.securesms' }, catalog, pkgOf).id, 1);
  assert.equal(findCatalogMatch({ name: 'SIGNAL' }, catalog, pkgOf).id, 1);
  assert.equal(findCatalogMatch({ name: 'Maps' }, catalog, pkgOf), null); // deux candidats : on ne fusionne pas
  assert.equal(findCatalogMatch({ name: 'Inconnue' }, catalog, pkgOf), null);
});
