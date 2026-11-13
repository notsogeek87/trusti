import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter, createApiCache } from '../../server/protection.js';

test('limiteur : bloque au-delà du maximum puis libère après la fenêtre', () => {
  let t = 0;
  const lim = createRateLimiter({ windowMs: 1000, max: 2, now: () => t });
  assert.equal(lim.check('a').allowed, true);
  assert.equal(lim.check('a').allowed, true);
  const third = lim.check('a');
  assert.equal(third.allowed, false);
  assert.equal(third.retryAfterSec, 1);
  assert.equal(lim.check('b').allowed, true, 'une autre IP n\'est pas touchée');
  t = 1000;
  assert.equal(lim.check('a').allowed, true);
});

function fakeRes() {
  const res = { statusCode: 200, headers: {}, sent: null };
  res.setHeader = (k, v) => { res.headers[k] = v; };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.sent = b; return res; };
  return res;
}

test('cache : sert la 2e lecture depuis la mémoire et se vide sur écriture', () => {
  let t = 0;
  const cache = createApiCache({ ttlMs: 30_000, now: () => t });
  let calls = 0;
  const handler = (req, res) => { calls += 1; res.status(200).json({ n: calls }); };
  const run = (method) => {
    const req = { method, originalUrl: '/api/apps?limit=1' };
    const res = fakeRes();
    cache.middleware(req, res, () => handler(req, res));
    return res;
  };
  assert.deepEqual(run('GET').sent, { n: 1 });
  const second = run('GET');
  assert.deepEqual(second.sent, { n: 1 });
  assert.equal(second.headers['X-Cache'], 'HIT');
  run('POST');
  assert.deepEqual(run('GET').sent, { n: 3 });
  t = 31_000;
  assert.deepEqual(run('GET').sent, { n: 4 }, 'expiré après le TTL');
});
