import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseAppLink, extractFirstUrl, findCatalogAppForLink, extractStoreTitle, normalizeGithubUrl,
} from '../../src/utils/appLinks.js';

test('Play Store : lien normal, avec paramètres, dans une phrase, market://', () => {
  assert.deepEqual(parseAppLink('https://play.google.com/store/apps/details?id=com.discord'),
    { kind: 'play', packageName: 'com.discord', url: 'https://play.google.com/store/apps/details?id=com.discord' });
  assert.equal(parseAppLink('https://play.google.com/store/apps/details?id=com.discord&hl=fr&gl=FR').packageName, 'com.discord');
  assert.equal(parseAppLink('Regarde cette app sur Google Play : https://play.google.com/store/apps/details?id=fr.vinted. Super !').packageName, 'fr.vinted');
  assert.equal(parseAppLink('market://details?id=org.thoughtcrime.securesms').packageName, 'org.thoughtcrime.securesms');
});

test('F-Droid : lien du bouton Partager (sans « / » final), avec / sans langue', () => {
  assert.equal(parseAppLink('https://f-droid.org/packages/app.alextran.immich').packageName, 'app.alextran.immich');
  assert.equal(parseAppLink('https://f-droid.org/packages/app.alextran.immich/').kind, 'fdroid');
  assert.equal(parseAppLink('https://f-droid.org/fr/packages/org.fdroid.fdroid/').packageName, 'org.fdroid.fdroid');
  assert.equal(parseAppLink('https://www.f-droid.org/packages/net.youapps.calcyou/#versions').packageName, 'net.youapps.calcyou');
});

test('GitHub : dépôt seulement, pas de package', () => {
  const info = parseAppLink('https://github.com/ImranR98/Obtainium');
  assert.equal(info.kind, 'github'); assert.equal(info.repo, 'Obtainium'); assert.equal(info.packageName, undefined);
  assert.equal(parseAppLink('https://github.com/immich-app/immich/releases/tag/v1.0').repo, 'immich');
  assert.equal(parseAppLink('https://github.com/you-apps/CalcYou.git').repo, 'CalcYou');
  assert.equal(parseAppLink('https://github.com/orgs/foo/people'), null);
  assert.equal(parseAppLink('https://github.com/settings'), null);
});

test('liens refusés : autres sites, schémas dangereux, packages invalides, pas un lien', () => {
  for (const bad of [
    'https://evil.example/store/apps/details?id=com.discord',
    'https://play.google.com.evil.example/store/apps/details?id=com.discord',
    'https://play.google.com/store/apps/details?id=pas un package',
    'https://play.google.com/store/apps/details',
    'javascript:alert(1)',
    'ftp://f-droid.org/packages/a.b',
    'https://f-droid.org/packages/<script>',
    'https://f-droid.org/a/b/packages/a.b',
    'bonjour', '', null, undefined, 42,
  ]) assert.equal(parseAppLink(bad), null, String(bad));
});

test('extractFirstUrl enlève la ponctuation finale et borne la taille', () => {
  assert.equal(extractFirstUrl('voir (https://f-droid.org/packages/a.b).'), 'https://f-droid.org/packages/a.b');
  assert.equal(extractFirstUrl('x'.repeat(5000)), null);
});

test('recherche locale dans le catalogue : package, F-Droid, dépôt GitHub', () => {
  const getPackage = (a) => a.androidPackage || a.playStoreUrl?.match(/id=([A-Za-z0-9._]+)/)?.[1] || null;
  const catalog = [
    { id: 1, name: 'Discord', playStoreUrl: 'https://play.google.com/store/apps/details?id=com.discord' },
    { id: 2, name: 'Immich', fDroidUrl: 'https://f-droid.org/packages/app.alextran.immich/' },
    { id: 3, name: 'Obtainium', githubUrl: 'https://github.com/ImranR98/Obtainium' },
  ];
  assert.equal(findCatalogAppForLink(parseAppLink('https://play.google.com/store/apps/details?id=com.discord'), catalog, getPackage).id, 1);
  assert.equal(findCatalogAppForLink(parseAppLink('https://f-droid.org/packages/app.alextran.immich'), catalog, getPackage).id, 2);
  assert.equal(findCatalogAppForLink(parseAppLink('https://github.com/imranr98/obtainium/'), catalog, getPackage).id, 3);
  assert.equal(findCatalogAppForLink(parseAppLink('https://github.com/autre/projet'), catalog, getPackage), null);
  assert.equal(normalizeGithubUrl('https://github.com/ImranR98/Obtainium.git'), 'imranr98/obtainium');
});

test('titre de page de magasin : Play Store et F-Droid, entités HTML, formes inattendues', () => {
  assert.equal(extractStoreTitle('<html><head><title>Immich - Apps on Google Play</title>', 'play'), 'Immich');
  assert.equal(extractStoreTitle('<title>Tom &amp; Jerry: Chase - Apps on Google Play</title>', 'play'), 'Tom & Jerry: Chase');
  assert.equal(extractStoreTitle('<title>Immich | F-Droid - Free and Open Source Android App Repository</title>', 'fdroid'), 'Immich');
  assert.equal(extractStoreTitle('<title>Connexion Google</title>', 'play'), '');   // page de consentement, pas l'app
  assert.equal(extractStoreTitle('pas de html', 'fdroid'), '');
  assert.equal(extractStoreTitle('<title>X - Apps on Google Play</title>', 'github'), '');
  assert.ok(extractStoreTitle(`<title>${'a'.repeat(250)} - Apps on Google Play</title>`, 'play').length <= 80);
});
