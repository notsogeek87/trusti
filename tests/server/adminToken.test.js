import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { isAdminEmail, generateOtpCode, createAdminToken, verifyAdminToken } from '../../server/adminToken.js';

const saved = { ...process.env };
afterEach(() => {
  for (const key of ['ADMIN_EMAIL', 'VERCEL_ENV', 'ADMIN_SESSION_SECRET']) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
});

test('isAdminEmail compare sans tenir compte de la casse ni des espaces', () => {
  process.env.ADMIN_EMAIL = 'Admin@Example.com';
  assert.equal(isAdminEmail(' admin@example.COM '), true);
  assert.equal(isAdminEmail('other@example.com'), false);
});

test('isAdminEmail accepte tout email sans ADMIN_EMAIL hors production', () => {
  delete process.env.ADMIN_EMAIL;
  process.env.VERCEL_ENV = 'preview';
  assert.equal(isAdminEmail('anyone@example.com'), true);
});

test('isAdminEmail refuse tout email sans ADMIN_EMAIL en production', () => {
  delete process.env.ADMIN_EMAIL;
  process.env.VERCEL_ENV = 'production';
  assert.equal(isAdminEmail('anyone@example.com'), false);
});

test('generateOtpCode produit 6 chiffres', () => {
  for (let i = 0; i < 200; i++) {
    assert.match(generateOtpCode(), /^[1-9]\d{5}$/);
  }
});

test('un jeton admin falsifié est rejeté', () => {
  process.env.ADMIN_SESSION_SECRET = 'test-secret';
  const token = createAdminToken('admin@example.com');
  assert.deepEqual(verifyAdminToken(token), { email: 'admin@example.com' });
  const [payload, sig] = token.split('.');
  assert.equal(verifyAdminToken(`${payload}.${sig.replace(/^./, c => (c === 'a' ? 'b' : 'a'))}`), null);
});
