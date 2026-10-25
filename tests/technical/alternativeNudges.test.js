import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildNudgeCandidates, isMyAppsListSettled } from '../../src/utils/alternativeNudges.js';

const play = (id) => `https://play.google.com/store/apps/details?id=${id}`;

const whatsapp = { id: '1', name: 'WhatsApp', grade: 'D', alternative: 'Signal', altGrade: 'A', alternativeAdopted: false, playStoreUrl: play('com.whatsapp') };
const tiktok = { id: '2', name: 'TikTok', grade: 'E', alternative: 'Pixelfed', altGrade: 'C', alternativeAdopted: false, playStoreUrl: play('com.zhiliaoapp.musically') };
const spotify = { id: '3', name: 'Spotify', grade: 'C', alternative: 'Deezer', altGrade: 'B', alternativeAdopted: false, playStoreUrl: play('com.spotify.music') };
const gmail = { id: '4', name: 'Gmail', grade: 'D', alternative: 'Proton Mail', altGrade: 'C', alternativeAdopted: false, playStoreUrl: play('com.google.android.gm') };

test('les apps C, D et E avec une alternative mieux notée (A, B ou C) sont retenues, la pire en premier', () => {
  const ids = buildNudgeCandidates([spotify, gmail, whatsapp, tiktok]).map(c => c.appId);
  // E d'abord, puis les D (plus grand écart de note d'abord), puis C
  assert.deepEqual(ids, ['2', '1', '4', '3']);
});

test('le format transmis au natif contient le package Android', () => {
  assert.deepEqual(buildNudgeCandidates([whatsapp])[0], {
    appId: '1', appName: 'WhatsApp', appGrade: 'D', altName: 'Signal', altGrade: 'A', packageName: 'com.whatsapp',
  });
});

test('pas de suggestion sans alternative strictement meilleure', () => {
  const sameGrade = { ...spotify, altGrade: 'C' };
  const noAlt = { ...whatsapp, alternative: undefined, altGrade: undefined };
  const goodApp = { ...spotify, grade: 'B', altGrade: 'A' };
  assert.deepEqual(buildNudgeCandidates([sameGrade, noAlt, goodApp]), []);
});

test('pas de suggestion pour une app déjà migrée ou sans package Android', () => {
  const adopted = { ...whatsapp, alternativeAdopted: true };
  const noPackage = { ...tiktok, playStoreUrl: null };
  assert.deepEqual(buildNudgeCandidates([adopted, noPackage]), []);
  assert.deepEqual(buildNudgeCandidates([whatsapp], { migratedApps: new Set(['1']) }), []);
  assert.deepEqual(buildNudgeCandidates([whatsapp], { customMigrations: new Map([['1', 'Olvid']]) }), []);
});

test('une liste encore en chargement n\'est pas considérée comme complète', () => {
  assert.equal(isMyAppsListSettled([whatsapp]), true);
  assert.equal(isMyAppsListSettled([whatsapp, { id: '9', isLoadingSkeleton: true }]), false);
  assert.equal(isMyAppsListSettled([{ ...whatsapp, isLoadingAlternative: true }]), false);
});
