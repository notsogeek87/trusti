import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { isAuthorizedAdminRequest, safeEqual } from '../../server/adminToken.js';

const saved = process.env.API_KEY;
afterEach(() => {
  if (saved === undefined) delete process.env.API_KEY;
  else process.env.API_KEY = saved;
});

const req = (headers) => ({ headers });

test('safeEqual compare en temps constant', () => {
  assert.equal(safeEqual('abc', 'abc'), true);
  assert.equal(safeEqual('abc', 'abd'), false);
  assert.equal(safeEqual('abc', 'abcd'), false);
});

test('écriture autorisée avec la bonne x-api-key', () => {
  process.env.API_KEY = 'secret';
  assert.equal(isAuthorizedAdminRequest(req({ 'x-api-key': 'secret' })), true);
});

test('écriture refusée avec une mauvaise clé, sans clé ou avec un Bearer', () => {
  process.env.API_KEY = 'secret';
  assert.equal(isAuthorizedAdminRequest(req({ 'x-api-key': 'autre' })), false);
  assert.equal(isAuthorizedAdminRequest(req({})), false);
  assert.equal(isAuthorizedAdminRequest(req({ authorization: 'Bearer secret' })), false);
});

test('écriture refusée si API_KEY n\'est pas configurée (fail-closed)', () => {
  delete process.env.API_KEY;
  assert.equal(isAuthorizedAdminRequest(req({ 'x-api-key': '' })), false);
  assert.equal(isAuthorizedAdminRequest(req({ 'x-api-key': 'undefined' })), false);
});
