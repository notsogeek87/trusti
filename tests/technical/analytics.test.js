import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  umamiAttributes, loadAnalytics, UMAMI_SCRIPT_URL, WEB_WEBSITE_ID, WEB_DOMAIN, ANDROID_WEBSITE_ID,
} from '../../src/utils/analytics.js';

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

test('app web : site web limité au domaine de production', () => {
  assert.deepEqual(umamiAttributes({ nativeAndroid: false }), {
    'data-website-id': WEB_WEBSITE_ID,
    'data-domains': WEB_DOMAIN,
  });
});

test('APK : site Android sans filtre de domaine (servi en https://localhost)', () => {
  const attrs = umamiAttributes({ nativeAndroid: true });
  if (!ANDROID_WEBSITE_ID) return assert.equal(attrs, null);
  assert.deepEqual(attrs, { 'data-website-id': ANDROID_WEBSITE_ID });
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
