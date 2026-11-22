import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  umamiAttributes, loadAnalytics, screenPath, trackScreen, flushPendingScreen, resetScreenTracking,
  UMAMI_SCRIPT_URL, WEB_WEBSITE_ID, WEB_DOMAIN, ANDROID_WEBSITE_ID,
} from '../../src/utils/analytics.js';
import { TABS } from '../../src/constants/tabs.js';

function fakeDoc() {
  const head = [];
  return {
    head: { appendChild: (el) => head.push(el) },
    added: head,
    querySelector: (sel) => head.find((el) => sel === `script[src="${el.src}"]`) || null,
    createElement: () => {
      const attrs = {};
      return { attrs, setAttribute: (k, v) => { attrs[k] = v; } };
    },
  };
}

// Simule window.umami : enregistre les adresses envoyées par track(fn)
function fakeWin() {
  const sent = [];
  return {
    sent,
    umami: { track: (fn) => sent.push(fn({ website: 'x', url: '/' }).url) },
  };
}

beforeEach(() => resetScreenTracking());

test('app web : site web limité au domaine de production, suivi auto coupé', () => {
  assert.deepEqual(umamiAttributes({ nativeAndroid: false }), {
    'data-website-id': WEB_WEBSITE_ID,
    'data-domains': WEB_DOMAIN,
    'data-auto-track': 'false',
  });
});

test('APK : site Android sans filtre de domaine (servi en https://localhost)', () => {
  assert.deepEqual(umamiAttributes({ nativeAndroid: true }), {
    'data-website-id': ANDROID_WEBSITE_ID,
    'data-auto-track': 'false',
  });
  assert.notEqual(ANDROID_WEBSITE_ID, WEB_WEBSITE_ID);
});

test('loadAnalytics ajoute un seul script, en defer', () => {
  const doc = fakeDoc();
  assert.equal(loadAnalytics({ nativeAndroid: false, doc }), true);
  assert.equal(loadAnalytics({ nativeAndroid: false, doc }), false);
  assert.equal(doc.added.length, 1);
  const [s] = doc.added;
  assert.equal(s.src, UMAMI_SCRIPT_URL);
  assert.equal(s.defer, true);
  assert.equal(s.attrs['data-website-id'], WEB_WEBSITE_ID);
});

test('loadAnalytics sans document ne plante pas', () => {
  assert.equal(loadAnalytics({ nativeAndroid: false, doc: null }), false);
});

test('screenPath : onglets et écrans, dans l\'ordre de priorité de l\'affichage', () => {
  assert.equal(screenPath({ tab: TABS.APPLICATIONS }), '/applications');
  assert.equal(screenPath({ tab: TABS.MY_APPS }), '/mes-apps');
  assert.equal(screenPath({ tab: TABS.TOP_ALTERNATIVES }), '/top-alternatives');
  assert.equal(screenPath({ tab: 'inconnu' }), '/applications');
  assert.equal(screenPath({ appDetail: true, tab: TABS.MY_APPS }), '/fiche-app');
  assert.equal(screenPath({ storage: true, tab: TABS.MY_APPS }), '/stockage');
  assert.equal(screenPath({ inbox: true }), '/notifications');
  assert.equal(screenPath({ onboarding: true, appDetail: true }), '/onboarding');
  assert.equal(screenPath({ landing: true, onboarding: true }), '/presentation');
  assert.equal(screenPath({ rescan: true, appDetail: true }), '/rescan');
});

test('trackScreen envoie une page vue virtuelle, sans doublon consécutif', () => {
  const win = fakeWin();
  assert.equal(trackScreen('/applications', win), true);
  assert.equal(trackScreen('/applications', win), false);
  assert.equal(trackScreen('/fiche-app', win), true);
  assert.equal(trackScreen('/applications', win), true);
  assert.deepEqual(win.sent, ['/applications', '/fiche-app', '/applications']);
});

test('trackScreen avant le chargement du script : envoyé au chargement', () => {
  const win = {};
  assert.equal(trackScreen('/mes-apps', win), false);
  const loaded = fakeWin();
  assert.equal(flushPendingScreen(loaded), true);
  assert.deepEqual(loaded.sent, ['/mes-apps']);
  assert.equal(flushPendingScreen(loaded), false);
});

test('trackScreen ne plante jamais l\'app', () => {
  const broken = { umami: { track: () => { throw new Error('boom'); } } };
  assert.doesNotThrow(() => trackScreen('/stockage', broken));
  assert.equal(trackScreen(null, fakeWin()), false);
  assert.equal(trackScreen('/x', null), false);
});
