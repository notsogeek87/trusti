import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createPublicApiRouter } from '../../server/publicApi/router.js';
import { createPartnerResolver, extractKey, generateKey, hashKey } from '../../server/publicApi/partners.js';
import { parseListQuery, toPublicApp, toPublicAssessment, BadRequest, DATA_LICENSE } from '../../server/publicApi/format.js';
import { openApiSpec } from '../../server/publicApi/openapi.js';

const ROW = {
  id: 'signal', name: 'Signal', trusti_score: 'A', category: 'Messagerie', developer: 'Signal Foundation',
  jurisdiction: 'US', is_european: false, is_open_source: true, license: 'AGPL-3.0', website: 'https://signal.org',
  icon: 'https://example.org/signal.png', reason: 'Chiffré de bout en bout', description: 'Messagerie',
  play_store_url: 'https://play.google.com/store/apps/details?id=org.thoughtcrime.securesms', apple_store_url: null,
  f_droid_url: '', github_url: 'https://github.com/signalapp', other_store_url: null,
  updated_at: '2026-11-10 08:30:00.123', score: 82, provisional: false, assessed_at: '2026-11-01',
  color: 'bg-blue-600', popularity: 3, team_pick: true,
};
const ROW_B = { ...ROW, id: 'whatsapp', name: 'WhatsApp', trusti_score: 'E', icon: 'data:image/png;base64,xx', assessed_at: null };

const ASSESSMENT = {
  appId: 'signal', grade: 'A', score: 82, scoreRange: null, computedGrade: 'A', overridden: false,
  provisional: false, hasUnverifiedSources: true, assessedAt: '2026-11-01', summary: 'Résumé',
  criteria: [{
    key: 'controle', name: 'Contrôle', weight: 0.3, points: 25, levelTitle: 'Fort', levelDescription: 'aucune dépendance',
    confidence: 'high', rationale: 'Parce que', provisional: false,
    sources: [{ kind: 'web', url: 'https://signal.org', quote: 'x', toConfirm: false }],
  }],
};

// --- Fonctions pures --------------------------------------------------------

test('toPublicApp : ne sort que les champs du contrat', () => {
  const app = toPublicApp(ROW);
  assert.equal(app.id, 'signal');
  assert.equal(app.grade, 'A');
  assert.equal(app.gradeReason, 'Chiffré de bout en bout');
  assert.equal(app.links.fDroid, null, 'chaîne vide -> null');
  assert.deepEqual(app.assessment, { score: 82, provisional: false, assessedAt: '2026-11-01' });
  assert.equal(app.updatedAt, '2026-11-10T08:30:00Z');
  assert.equal(app.trustiUrl, 'https://app.trusti-score.eu/?app=signal');
  for (const internal of ['color', 'popularity', 'team_pick', 'teamPick', 'trusti_score']) {
    assert.ok(!(internal in app), `${internal} ne doit pas sortir`);
  }
  const b = toPublicApp(ROW_B);
  assert.equal(b.icon, null, 'icône non https écartée');
  assert.equal(b.assessment, null);
});

test('toPublicAssessment : critères et sources détaillés', () => {
  const a = toPublicAssessment(ASSESSMENT, { firstAssessedAt: '2026-10-01', changes: [] });
  assert.equal(a.criteria[0].level, 'Fort');
  assert.equal(a.criteria[0].sources[0].url, 'https://signal.org');
  assert.equal(a.gradeHistory.firstAssessedAt, '2026-10-01');
  assert.equal(toPublicAssessment(null), null);
});

test('parseListQuery : valeurs par défaut et validation', () => {
  const d = parseListQuery({});
  assert.equal(d.page, 1);
  assert.equal(d.perPage, 50);
  assert.equal(d.offset, 0);
  assert.equal(d.grades, null);
  const f = parseListQuery({ page: '3', per_page: '20', grade: 'a, b,a', category: ' Messagerie ', updated_since: '2026-11-01' });
  assert.deepEqual(f.grades, ['A', 'B']);
  assert.equal(f.offset, 40);
  assert.equal(f.category, 'Messagerie');
  assert.equal(f.updatedSince, '2026-11-01');
  for (const bad of [{ page: '0' }, { per_page: '101' }, { grade: 'F' }, { updated_since: '2026-02-30' }, { q: 'a' }, { page: '1.5' }]) {
    assert.throws(() => parseListQuery(bad), BadRequest, JSON.stringify(bad));
  }
});

test('clés : format, extraction et résolution avec cache', async () => {
  const key = generateKey();
  assert.match(key, /^tsk_[A-Za-z0-9_-]{32}$/);
  assert.equal(extractKey(`Bearer ${key}`), key);
  assert.equal(extractKey(key), null, 'sans « Bearer »');
  assert.equal(extractKey('Bearer autre_chose_quelconque'), null, 'mauvais préfixe');

  let t = 0;
  let queries = 0;
  const touched = [];
  const resolve = createPartnerResolver({
    query: async (hash) => { queries += 1; return hash === hashKey(key) ? { id: 7, name: 'P', rate_per_minute: 30 } : null; },
    touch: async (id) => { touched.push(id); },
    ttlMs: 1000,
    now: () => t,
  });
  assert.deepEqual(await resolve(key), { id: '7', name: 'P', ratePerMinute: 30 });
  await resolve(key);
  assert.equal(queries, 1, 'deuxième appel servi par le cache');
  assert.equal(await resolve('tsk_inconnue_inconnue_inconnue'), null);
  await resolve('tsk_inconnue_inconnue_inconnue');
  assert.equal(queries, 2, 'clé inconnue aussi en cache');
  t = 1000;
  await resolve(key);
  assert.equal(queries, 3, 'cache expiré : relu en base');
  assert.deepEqual(touched, ['7', '7']);
});

test('licence présente', () => {
  assert.equal(DATA_LICENSE.license, 'CC-BY-4.0');
  assert.match(DATA_LICENSE.attribution, /TrustiScore/);
});

// --- Routeur ----------------------------------------------------------------

const KEY = 'tsk_cle_de_test_partenaire_0123456789';
const SLOW_KEY = 'tsk_cle_de_test_partenaire_lent_0001';
const calls = [];
const fakeDb = {
  async listApps(f) {
    calls.push(['listApps', f]);
    const rows = [ROW, ROW_B].filter(r => !f.grades || f.grades.includes(r.trusti_score));
    return { rows: rows.slice(f.offset, f.offset + f.limit), total: rows.length };
  },
  async getAppsByIds(ids) { return [ROW, ROW_B].filter(r => ids.includes(r.id)); },
  async getCategories() { return [{ name: 'Messagerie', count: 2 }]; },
  async getAllAssessments() { return new Map([['signal', ASSESSMENT]]); },
  async getAssessment(id) { return id === 'signal' ? ASSESSMENT : null; },
  async getGradeHistory() { return { firstAssessedAt: '2026-10-01', changes: [] }; },
  async getGradeChangesSince() { return [{ appId: 'signal', name: 'Signal', previousGrade: 'B', grade: 'A', date: '2026-11-01' }]; },
  async getAlternativeIds(id) { return id === 'whatsapp' ? ['signal'] : []; },
  async translate(lang, { apps = [], assessments = [] }) {
    if (lang !== 'en') return { apps, assessments };
    return { apps: apps.map(a => ({ ...a, reason: `EN ${a.reason}` })), assessments: assessments.map(a => ({ ...a, summary: 'EN summary' })) };
  },
};

const app = express();
app.use('/api/v1', createPublicApiRouter({
  resolvePartner: async (key) => {
    if (key === KEY) return { id: '1', name: 'Partenaire test', ratePerMinute: 1000 };
    if (key === SLOW_KEY) return { id: '2', name: 'Lent', ratePerMinute: 2 };
    return null;
  },
  db: fakeDb,
  cacheTtlMs: 0,
  exportTtlMs: 0,
}));
const server = app.listen(0);
after(() => server.close());
const base = () => `http://127.0.0.1:${server.address().port}/api/v1`;
const get = (path, key = KEY, init = {}) =>
  fetch(base() + path, { ...init, headers: key ? { Authorization: `Bearer ${key}` } : {} });

test('sans clé ou clé inconnue : 401, pas de données', async () => {
  for (const key of [null, 'tsk_pas_une_vraie_cle_000000000']) {
    const res = await get('/apps', key);
    assert.equal(res.status, 401);
    assert.equal((await res.json()).error.code, 'unauthorized');
    assert.ok(res.headers.get('www-authenticate'));
  }
});

test('spec OpenAPI lisible sans clé et à jour des routes', async () => {
  const res = await get('/openapi.json', null);
  assert.equal(res.status, 200);
  const spec = await res.json();
  assert.equal(spec.openapi, '3.1.0');
  for (const path of ['/apps', '/apps/{id}', '/apps/{id}/assessment', '/apps/{id}/alternatives', '/grade-changes', '/categories', '/export']) {
    assert.ok(spec.paths[path], `${path} documentée`);
  }
  assert.deepEqual(spec, JSON.parse(JSON.stringify(openApiSpec)));
});

test('écriture refusée : 405', async () => {
  const res = await fetch(`${base()}/apps`, { method: 'POST', headers: { Authorization: `Bearer ${KEY}` } });
  assert.equal(res.status, 405);
  assert.equal(res.headers.get('allow'), 'GET, HEAD');
});

test('GET /apps : enveloppe, licence, pagination, filtres', async () => {
  const res = await get('/apps?grade=A&per_page=10');
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('access-control-allow-origin'), null, 'pas de CORS');
  assert.equal(res.headers.get('x-ratelimit-limit'), '1000');
  const body = await res.json();
  assert.equal(body.meta.license, 'CC-BY-4.0');
  assert.deepEqual(body.meta.pagination, { page: 1, perPage: 10, total: 1, totalPages: 1 });
  assert.deepEqual(body.data.map(a => a.id), ['signal']);
  assert.equal(body.meta.lang, 'fr');
});

test('GET /apps : paramètre invalide -> 400', async () => {
  const res = await get('/apps?grade=Z');
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error.code, 'bad_request');
});

test('GET /apps?lang=en : textes traduits', async () => {
  const body = await (await get('/apps?lang=en')).json();
  assert.equal(body.data[0].gradeReason, 'EN Chiffré de bout en bout');
  assert.equal(body.meta.lang, 'en');
});

test('GET /apps/:id et 404', async () => {
  const body = await (await get('/apps/signal')).json();
  assert.equal(body.data.name, 'Signal');
  const res = await get('/apps/inconnue');
  assert.equal(res.status, 404);
  assert.equal((await res.json()).error.code, 'not_found');
});

test('GET /apps/:id/assessment : détail, ou not_assessed', async () => {
  const body = await (await get('/apps/signal/assessment?lang=en')).json();
  assert.equal(body.data.criteria[0].rationale, 'Parce que');
  assert.equal(body.data.summary, 'EN summary');
  assert.equal(body.data.gradeHistory.firstAssessedAt, '2026-10-01');
  const res = await get('/apps/whatsapp/assessment');
  assert.equal(res.status, 404);
  assert.equal((await res.json()).error.code, 'not_assessed');
});

test('GET /apps/:id/alternatives', async () => {
  const body = await (await get('/apps/whatsapp/alternatives')).json();
  assert.deepEqual(body.data.map(a => a.id), ['signal']);
});

test('GET /grade-changes, /categories, /export', async () => {
  const changes = await (await get('/grade-changes?since=2026-10-01')).json();
  assert.equal(changes.data[0].grade, 'A');
  assert.equal((await get('/grade-changes?since=hier')).status, 400);

  const cats = await (await get('/categories')).json();
  assert.deepEqual(cats.data, [{ name: 'Messagerie', count: 2 }]);

  const exp = await (await get('/export')).json();
  assert.equal(exp.meta.count, 2);
  const signal = exp.data.find(a => a.id === 'signal');
  assert.equal(signal.assessmentDetail.criteria.length, 1);
  assert.equal(exp.data.find(a => a.id === 'whatsapp').assessmentDetail, null);
});

test('route inconnue : 404 JSON', async () => {
  const res = await get('/nimporte');
  assert.equal(res.status, 404);
  assert.equal((await res.json()).error.code, 'not_found');
});

test('limite de débit par partenaire : 429 avec Retry-After', async () => {
  assert.equal((await get('/categories', SLOW_KEY)).status, 200);
  assert.equal((await get('/categories', SLOW_KEY)).status, 200);
  const res = await get('/categories', SLOW_KEY);
  assert.equal(res.status, 429);
  assert.ok(Number(res.headers.get('retry-after')) > 0);
  assert.equal((await get('/categories')).status, 200, 'les autres partenaires ne sont pas touchés');
});
