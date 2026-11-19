import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatEvent, validateEventProposal, validateStatusChange } from '../../server/appEvents.js';
import handler from '../../api/app-events.js';

const NOW = new Date('2026-11-19T12:00:00Z');

const valid = {
  app_id: 'whatsapp',
  type: 'incident',
  impact: 'negative',
  severity: 'high',
  title: 'Fuite de données de 12 millions de comptes',
  summary: 'Des numéros de téléphone ont été exposés.',
  source_url: 'https://www.cnil.fr/fr/exemple',
  event_date: '2026-11-17',
};

test('validateEventProposal : proposition complète acceptée et nettoyée', () => {
  const check = validateEventProposal({ ...valid, title: '  Fuite   de données  ' }, NOW);
  assert.equal(check.ok, true);
  assert.equal(check.value.title, 'Fuite de données');
  assert.equal(check.value.appId, 'whatsapp');
  assert.equal(check.value.eventDate, '2026-11-17');
});

test('validateEventProposal : gravité par défaut moyenne, noms camelCase acceptés', () => {
  const { app_id, source_url, event_date, severity, ...rest } = valid;
  const check = validateEventProposal({ ...rest, appId: app_id, sourceUrl: source_url, eventDate: event_date }, NOW);
  assert.equal(check.ok, true);
  assert.equal(check.value.severity, 'medium');
});

test('validateEventProposal : refuse les valeurs hors liste', () => {
  assert.equal(validateEventProposal({ ...valid, type: 'rumeur' }, NOW).ok, false);
  assert.equal(validateEventProposal({ ...valid, impact: 'grave' }, NOW).ok, false);
  assert.equal(validateEventProposal({ ...valid, severity: 'critical' }, NOW).ok, false);
});

test('validateEventProposal : source https obligatoire', () => {
  assert.equal(validateEventProposal({ ...valid, source_url: 'http://exemple.fr' }, NOW).ok, false);
  assert.equal(validateEventProposal({ ...valid, source_url: 'javascript:alert(1)' }, NOW).ok, false);
  assert.equal(validateEventProposal({ ...valid, source_url: undefined }, NOW).ok, false);
});

test('validateEventProposal : date valide et pas dans le futur', () => {
  assert.equal(validateEventProposal({ ...valid, event_date: '2026-02-30' }, NOW).ok, false);
  assert.equal(validateEventProposal({ ...valid, event_date: '2026-12-25' }, NOW).ok, false);
  assert.equal(validateEventProposal({ ...valid, event_date: '2026-11-20' }, NOW).ok, true); // marge d'un jour
});

test('validateEventProposal : app, titre et corps requis', () => {
  assert.equal(validateEventProposal(null, NOW).ok, false);
  assert.equal(validateEventProposal({ ...valid, app_id: ' ' }, NOW).ok, false);
  assert.equal(validateEventProposal({ ...valid, title: 'ab' }, NOW).ok, false);
});

test('validateStatusChange : id entier et statut connu', () => {
  assert.deepEqual(validateStatusChange({ id: '12', status: 'published' }), { ok: true, value: { id: 12, status: 'published' } });
  assert.equal(validateStatusChange({ id: 'x', status: 'published' }).ok, false);
  assert.equal(validateStatusChange({ id: 3, status: 'deleted' }).ok, false);
});

test('formatEvent : ne renvoie ni le statut ni l\'auteur, valeurs inconnues ramenées', () => {
  const event = formatEvent({
    id: 7, app_id: 'w', app_name: 'WhatsApp', type: 'bizarre', impact: 'negative', severity: 'high',
    title: 'T', summary: null, source_url: 'https://x.fr', event_date: '2026-11-17',
    published_at: '2026-11-18 10:00:00', status: 'published', proposed_by: 'veille-n8n',
  });
  assert.deepEqual(event, {
    id: '7', appId: 'w', appName: 'WhatsApp', type: 'other', impact: 'negative', severity: 'high',
    title: 'T', summary: null, sourceUrl: 'https://x.fr', date: '2026-11-17', publishedAt: '2026-11-18',
  });
});

// --- Route : contrôles faits avant tout accès à la base ---

function call({ method = 'GET', query = {}, body, headers = {} }) {
  return new Promise((resolve) => {
    const res = {
      statusCode: 200,
      headers: {},
      setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
      status(code) { this.statusCode = code; return this; },
      json(payload) { resolve({ status: this.statusCode, body: payload, headers: this.headers }); return this; },
      end() { resolve({ status: this.statusCode, headers: this.headers }); return this; },
    };
    handler({ method, query, body, headers }, res);
  });
}

test('route : écriture refusée sans clé', async () => {
  const saved = process.env.API_KEY;
  process.env.API_KEY = 'secret-test';
  try {
    assert.equal((await call({ method: 'POST', body: valid })).status, 401);
    assert.equal((await call({ method: 'PATCH', body: { id: 1, status: 'published' } })).status, 401);
    assert.equal((await call({ method: 'POST', body: valid, headers: { 'x-api-key': 'mauvaise' } })).status, 401);
  } finally {
    if (saved === undefined) delete process.env.API_KEY; else process.env.API_KEY = saved;
  }
});

test('route : propositions en attente jamais publiques ni mises en cache', async () => {
  const res = await call({ query: { status: 'proposed' } });
  assert.equal(res.status, 401);
  assert.equal(res.headers['cache-control'], 'no-store');
});

test('route : since invalide refusé', async () => {
  const res = await call({ query: { since: "2026-11-01' OR 1=1" } });
  assert.equal(res.status, 400);
});

test('route : proposition invalide refusée avant la base', async () => {
  const saved = process.env.API_KEY;
  process.env.API_KEY = 'secret-test';
  try {
    const res = await call({ method: 'POST', body: { ...valid, type: 'rumeur' }, headers: { 'x-api-key': 'secret-test' } });
    assert.equal(res.status, 400);
  } finally {
    if (saved === undefined) delete process.env.API_KEY; else process.env.API_KEY = saved;
  }
});
