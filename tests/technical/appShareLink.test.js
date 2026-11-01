import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PUBLIC_SITE_URL,
  getShareBaseUrl,
  buildAppShareUrl,
  parseSharedAppId,
  buildAppShareText,
} from '../../src/utils/appShareLink.js';

const webLocation = { origin: 'https://trusti.lielu.eu', pathname: '/' };

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
  assert.equal(buildAppShareUrl(42, { location: webLocation }), 'https://trusti.lielu.eu/?app=42');
  assert.equal(buildAppShareUrl('7', { isNative: true }), 'https://trusti.lielu.eu/?app=7');
});

test('lecture de l’ID depuis une query string ou une URL complète', () => {
  assert.equal(parseSharedAppId('?app=42'), '42');
  assert.equal(parseSharedAppId('https://trusti.lielu.eu/?app=42&utm=x'), '42');
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
