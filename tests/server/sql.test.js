import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toQuery, pickDriver } from '../../server/database/sql.js';

test('toQuery numérote les paramètres', () => {
  const q = toQuery(['SELECT * FROM t WHERE a = ', ' AND b = ', ''], [1, 'x']);
  assert.equal(q.text, 'SELECT * FROM t WHERE a = $1 AND b = $2');
  assert.deepEqual(q.values, [1, 'x']);
});

test('toQuery sans paramètre', () => {
  assert.deepEqual(toQuery(['SELECT 1'], []), { text: 'SELECT 1', values: [] });
});

test('pickDriver : Neon par hôte, pg sinon, DB_DRIVER prioritaire', () => {
  assert.equal(pickDriver('postgresql://u:p@ep-x.eu-central-1.aws.neon.tech/db', undefined), 'neon');
  assert.equal(pickDriver('postgresql://u:p@db.interne:5432/db', undefined), 'pg');
  assert.equal(pickDriver('postgresql://u:p@db.interne:5432/db', 'neon'), 'neon');
  assert.equal(pickDriver('postgresql://u:p@x.neon.tech/db', 'pg'), 'pg');
});
