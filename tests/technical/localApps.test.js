import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isLocalAppId, makeLocalId, cleanAppName, normalizeAppName,
  isValidPackageName, parseLocalApps, findCatalogMatch,
} from '../../src/utils/localApps.js';

const pkgOf = (app) => app.androidPackage || (app.playStoreUrl && app.playStoreUrl.match(/id=([a-zA-Z0-9._]+)/)?.[1]) || null;

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
  // package explicite (app hors Play Store)
  assert.equal(findCatalogMatch({ name: 'x', packageName: 'org.fdroid.fdroid' }, [...catalog, { id: 9, name: 'F-Droid', androidPackage: 'org.fdroid.fdroid' }], pkgOf).id, 9);
  assert.equal(findCatalogMatch({ name: 'Maps' }, catalog, pkgOf), null); // deux candidats : on ne fusionne pas
  assert.equal(findCatalogMatch({ name: 'Inconnue' }, catalog, pkgOf), null);
});

import { planCommonSync } from '../../src/utils/localApps.js';
import { getAndroidPackage } from '../../src/utils/androidPackage.js';
import { readFileSync } from 'node:fs';

const baseSync = {
  localApps: [], found: [], notInstalledPackages: [], dailyApps: new Set(), hasNote: () => false,
  makeId: (i) => `local-t${i}`,
};

test('planCommonSync : ajoute les apps courantes trouvées, sans doublon', () => {
  const plan = planCommonSync({
    ...baseSync,
    localApps: [{ id: 'local-old1', name: 'Déjà là', packageName: 'a.b' }, { id: 'local-old2', name: 'Manuelle' }],
    found: [
      { name: 'Déjà là', packageName: 'a.b' },        // même package
      { name: 'manuelle', packageName: 'c.d' },        // même nom qu'une ajout manuel
      { name: 'Nouvelle', packageName: 'e.f' },
      { name: 'Nouvelle bis', packageName: 'e.f' },    // même package dans le lot
      { name: 'Mauvais', packageName: 'pas un package' },
    ],
  });
  assert.deepEqual(plan.toAdd, [{ id: 'local-t2', name: 'Nouvelle', packageName: 'e.f', auto: true }]);
  assert.deepEqual(plan.removedIds, []);
});

test('planCommonSync : retire les apps auto désinstallées, jamais celles utilisées', () => {
  const local = [
    { id: 'local-a1', name: 'A', packageName: 'p.a', auto: true },
    { id: 'local-b1', name: 'B', packageName: 'p.b', auto: true },   // étoile
    { id: 'local-c1', name: 'C', packageName: 'p.c', auto: true },   // commentaire
    { id: 'local-d1', name: 'D', packageName: 'p.d' },               // ajout manuel
    { id: 'local-e1', name: 'E', packageName: 'p.e', auto: true },   // toujours installée
  ];
  const plan = planCommonSync({
    ...baseSync,
    localApps: local,
    notInstalledPackages: ['p.a', 'p.b', 'p.c', 'p.d'],
    dailyApps: new Set(['local-b1']),
    hasNote: (id) => id === 'local-c1',
  });
  assert.deepEqual(plan.removedIds, ['local-a1']);
});

test('getAndroidPackage : champ explicite prioritaire, sinon lien Play Store', () => {
  assert.equal(getAndroidPackage({ androidPackage: 'org.fdroid.fdroid', playStoreUrl: 'https://play.google.com/store/apps/details?id=x.y' }), 'org.fdroid.fdroid');
  assert.equal(getAndroidPackage({ playStoreUrl: 'https://play.google.com/store/apps/details?id=x.y' }), 'x.y');
  assert.equal(getAndroidPackage({ androidPackage: '<script>' }), null);
  assert.equal(getAndroidPackage(null), null);
});

test('commonApps.json : entrées valides et sans doublon', () => {
  const list = JSON.parse(readFileSync(new URL('../../src/constants/commonApps.json', import.meta.url), 'utf8'));
  assert.ok(list.length >= 100);
  const packages = new Set();
  for (const { name, packageName } of list) {
    assert.ok(typeof name === 'string' && name.trim() === name && name.length > 0 && name.length <= 80, `nom invalide : ${name}`);
    assert.ok(isValidPackageName(packageName), `package invalide : ${packageName}`);
    assert.ok(!packages.has(packageName), `doublon : ${packageName}`);
    packages.add(packageName);
  }
});

test('parseLocalApps conserve le drapeau auto', () => {
  assert.deepEqual(parseLocalApps([{ id: 'local-zz99', name: 'Z', packageName: 'a.b', auto: true }, { id: 'local-yy88', name: 'Y', auto: 'oui' }]),
    [{ id: 'local-zz99', name: 'Z', packageName: 'a.b', auto: true }, { id: 'local-yy88', name: 'Y' }]);
});
