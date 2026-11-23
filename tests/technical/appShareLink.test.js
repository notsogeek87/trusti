import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PUBLIC_SITE_URL,
  getShareBaseUrl,
  buildAppShareUrl,
  parseSharedAppId,
  buildAppShareText,
  buildAppsSelectionUrl,
  buildAppsSelectionText,
  MAX_SHARED_APPS,
  joinShareMessage,
} from '../../src/utils/appShareLink.js';

const webLocation = { origin: 'https://app.trusti-score.eu', pathname: '/' };

test('APK : la base de partage est toujours le site public', () => {
  assert.equal(
    getShareBaseUrl({ isNative: true, location: { origin: 'https://localhost', pathname: '/' } }),
    `${PUBLIC_SITE_URL}/`
  );
});

test('web : la base de partage suit l’adresse courante', () => {
  assert.equal(
    getShareBaseUrl({ location: { origin: 'https://preview.vercel.app', pathname: '/' } }),
    'https://preview.vercel.app/'
  );
});

test('origine non http (file:, capacitor:) : repli sur le site public', () => {
  assert.equal(getShareBaseUrl({ location: { origin: 'null', pathname: '/x' } }), `${PUBLIC_SITE_URL}/`);
  assert.equal(getShareBaseUrl(), `${PUBLIC_SITE_URL}/`);
});

test('lien de fiche app', () => {
  assert.equal(buildAppShareUrl(42, { location: webLocation }), 'https://app.trusti-score.eu/?app=42');
  assert.equal(buildAppShareUrl('7', { isNative: true }), 'https://app.trusti-score.eu/?app=7');
});

test('lecture de l’ID depuis une query string ou une URL complète', () => {
  assert.equal(parseSharedAppId('?app=42'), '42');
  assert.equal(parseSharedAppId('https://app.trusti-score.eu/?app=42&utm=x'), '42');
  assert.equal(parseSharedAppId(buildAppShareUrl(123, { isNative: true })), '123');
});

test('ID absent ou invalide : null', () => {
  assert.equal(parseSharedAppId(''), null);
  assert.equal(parseSharedAppId(null), null);
  assert.equal(parseSharedAppId('?apps=1,2'), null);
  assert.equal(parseSharedAppId('?app='), null);
  assert.equal(parseSharedAppId('?app=1,2'), null);
  assert.equal(parseSharedAppId('?app=%3Cscript%3E'), null);
  assert.equal(parseSharedAppId('https://[mal-formée'), null);
});

test('texte de partage', () => {
  assert.match(buildAppShareText({ name: 'Signal', grade: 'A' }).text, /Signal obtient la note A/);
  assert.equal(buildAppShareText({ name: 'Signal' }).title, 'Signal sur Trusti');
  assert.match(buildAppShareText({ name: 'Signal' }).text, /fiche de Signal/);
});

test('lien de sélection : IDs dans l’ordre, sans doublon, virgules lisibles', () => {
  assert.equal(
    buildAppsSelectionUrl(['1770752284146', 1769540682080, '1770752284146', 'app_1_x-y'], { isNative: true }),
    'https://app.trusti-score.eu/?apps=1770752284146,1769540682080,app_1_x-y'
  );
});

test('lien de sélection : IDs invalides ignorés, null si rien de valide', () => {
  assert.equal(
    buildAppsSelectionUrl(['42', 'a,b', '<script>', ' 7 '], { location: webLocation }),
    'https://app.trusti-score.eu/?apps=42,7'
  );
  assert.equal(buildAppsSelectionUrl([], { isNative: true }), null);
  assert.equal(buildAppsSelectionUrl(['../x'], { isNative: true }), null);
});

test('lien de sélection : limité à MAX_SHARED_APPS apps', () => {
  const ids = Array.from({ length: MAX_SHARED_APPS + 10 }, (_, i) => i + 1);
  const url = buildAppsSelectionUrl(ids, { isNative: true });
  assert.equal(new URL(url).searchParams.get('apps').split(',').length, MAX_SHARED_APPS);
});

test('lien de sélection : relu tel quel par le parseur de partage', () => {
  const url = buildAppsSelectionUrl(['12', 'app_3'], { location: { origin: 'https://preview.example', pathname: '/x' } });
  assert.equal(url, 'https://preview.example/x?apps=12,app_3');
  assert.equal(new URL(url).searchParams.get('apps'), '12,app_3');
});

test('texte de sélection : en-tête au pluriel et une ligne par app', () => {
  const { title, text } = buildAppsSelectionText([{ name: 'Mistral', grade: 'B' }, { name: 'Lumo' }]);
  assert.ok(title.length > 0);
  assert.match(text, /2 apps/);
  assert.match(text, /• Mistral : note B/);
  assert.match(text, /• Lumo$/m);
});

test('message de partage : le lien est seul sur sa ligne, après une ligne vide', () => {
  assert.equal(joinShareMessage('Voici :\n• A', 'https://x/?apps=1'), 'Voici :\n• A\n\nhttps://x/?apps=1');
  assert.equal(joinShareMessage('Texte \n', 'https://x'), 'Texte\n\nhttps://x');
  assert.equal(joinShareMessage('Texte'), 'Texte');
  assert.equal(joinShareMessage('', 'https://x'), 'https://x');
});
