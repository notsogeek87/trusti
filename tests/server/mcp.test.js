import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleRpc, isAuthorized, isSingleStatement } from '../../server/mcp.js';

const TOKEN = 'x'.repeat(40);
const fakeQuery = async (sql, params = []) => ({ command: 'SELECT', rowCount: 1, rows: [{ sql, params }] });

test('authentification : jeton exact exigé', () => {
  assert.equal(isAuthorized(`Bearer ${TOKEN}`, TOKEN), true);
  assert.equal(isAuthorized(`Bearer ${TOKEN}y`, TOKEN), false);
  assert.equal(isAuthorized(TOKEN, TOKEN), false);
  assert.equal(isAuthorized('Bearer court', 'court'), false, 'jeton trop court refusé');
});

test('une seule instruction SQL', () => {
  assert.equal(isSingleStatement('SELECT 1;'), true);
  assert.equal(isSingleStatement("UPDATE a SET b = 'x;y' WHERE id = 1"), true);
  assert.equal(isSingleStatement('SELECT 1; DROP TABLE applications'), false);
  assert.equal(isSingleStatement('   '), false);
});

test('initialize puis tools/list', async () => {
  const init = await handleRpc({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18' } }, fakeQuery);
  assert.equal(init.result.protocolVersion, '2025-06-18');
  assert.ok(init.result.capabilities.tools);
  const list = await handleRpc({ jsonrpc: '2.0', id: 2, method: 'tools/list' }, fakeQuery);
  assert.deepEqual(list.result.tools.map((t) => t.name), ['run_sql', 'list_tables', 'describe_table']);
  assert.equal(await handleRpc({ jsonrpc: '2.0', method: 'notifications/initialized' }, fakeQuery), null);
});

test('run_sql transmet SQL et paramètres, refuse plusieurs instructions', async () => {
  const ok = await handleRpc({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'run_sql', arguments: { sql: 'SELECT $1', params: [5] } } }, fakeQuery);
  const payload = JSON.parse(ok.result.content[0].text);
  assert.equal(payload.lignes[0].sql, 'SELECT $1');
  assert.deepEqual(payload.lignes[0].params, [5]);
  const ko = await handleRpc({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'run_sql', arguments: { sql: 'SELECT 1; SELECT 2' } } }, fakeQuery);
  assert.equal(ko.result.isError, true);
});

test('erreur SQL renvoyée comme résultat d\'outil en erreur', async () => {
  const boom = async () => { throw new Error('relation "x" does not exist'); };
  const r = await handleRpc({ jsonrpc: '2.0', id: 5, method: 'tools/call', params: { name: 'run_sql', arguments: { sql: 'SELECT * FROM x' } } }, boom);
  assert.equal(r.result.isError, true);
  assert.match(r.result.content[0].text, /does not exist/);
});
