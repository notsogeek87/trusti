import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  sizedIconUrl,
  iconAttemptUrl,
  bundledIconFile,
  isIconLoaded,
  isIconFailed,
  markIconLoaded,
  markIconFailed,
  resetIconCache,
  ICON_FAILED_TTL,
} from '../../src/utils/appIconLoader.js';

const SVG = 'https://www.hyperfluid.cloud/images/hyperfluid-icon.svg';
const PLAY = 'https://play-lh.googleusercontent.com/abcDEF123';

beforeEach(() => resetIconCache());

test('sizedIconUrl ne modifie pas les SVG distants', () => {
  assert.equal(sizedIconUrl(SVG), SVG);
  assert.equal(sizedIconUrl(PLAY), `${PLAY}=s96-rw`);
  assert.equal(sizedIconUrl(`${PLAY}=s512`), `${PLAY}=s512`);
  assert.equal(sizedIconUrl(undefined), undefined);
});

test('iconAttemptUrl : même URL puis cache-buster, jamais sur les URLs Google', () => {
  assert.equal(iconAttemptUrl(SVG, 0), SVG);
  assert.equal(iconAttemptUrl(SVG, 1), SVG);
  assert.equal(iconAttemptUrl(SVG, 2), `${SVG}?_r=2`);
  assert.equal(iconAttemptUrl(`${SVG}?v=1`, 2), `${SVG}?v=1&_r=2`);
  assert.equal(iconAttemptUrl(PLAY, 2), `${PLAY}=s96-rw`);
});

test('cache des icônes chargées et des échecs définitifs (avec expiration)', () => {
  assert.equal(isIconLoaded(SVG), false);
  markIconFailed(SVG, 1000);
  assert.equal(isIconFailed(SVG, 1000 + 10), true);
  assert.equal(isIconFailed(SVG, 1000 + ICON_FAILED_TTL + 1), false);
  markIconFailed(SVG);
  markIconLoaded(SVG);
  assert.equal(isIconLoaded(SVG), true);
  assert.equal(isIconFailed(SVG), false);
  assert.equal(isIconFailed(undefined), false);
});

test('bundledIconFile tolère un manifeste vide, invalide ou une URL absente', () => {
  assert.equal(bundledIconFile({}, SVG), null);
  assert.equal(bundledIconFile(null, SVG), null);
  assert.equal(bundledIconFile({ [SVG]: 'abc.svg' }, undefined), null);
  assert.equal(bundledIconFile({}, 'constructor'), null);
  assert.equal(bundledIconFile({ [SVG]: 'abc.svg' }, SVG), 'abc.svg');
});
