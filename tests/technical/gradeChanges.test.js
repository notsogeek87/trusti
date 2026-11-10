import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  changeKey, sinceForState, pendingGradeChanges, initialState, acknowledge, LOOKBACK_DAYS,
} from '../../src/utils/gradeChanges.js';

const NOW = new Date('2026-11-10T12:00:00Z');
const signal = { appId: '1769540367871', name: 'Signal', previousGrade: 'B', grade: 'C', date: '2026-10-25' };
const bitwarden = { appId: '1769804898711', name: 'Bitwarden', previousGrade: 'C', grade: 'B', date: '2026-11-03' };
const other = { appId: 'patfit', name: 'PAT.fit', previousGrade: 'A', grade: 'C', date: '2026-10-22' };

test('première visite : rien n\'est affiché et tout est marqué comme vu', () => {
  assert.deepEqual(pendingGradeChanges([signal], ['1769540367871'], null), []);
  const state = initialState([signal, bitwarden], NOW);
  assert.equal(state.seenAt, '2026-11-10');
  assert.deepEqual(pendingGradeChanges([signal, bitwarden], [signal.appId, bitwarden.appId], state), []);
});

test('seules les apps suivies sont retenues, baisses en premier', () => {
  const state = { seenAt: '2026-10-01', ack: [] };
  const pending = pendingGradeChanges([bitwarden, other, signal], new Set([signal.appId, bitwarden.appId]), state);
  assert.deepEqual(pending.map(c => [c.name, c.direction]), [['Signal', 'down'], ['Bitwarden', 'up']]);
});

test('« J\'ai vu » masque les changements affichés', () => {
  const state = { seenAt: '2026-10-01', ack: [] };
  const shown = pendingGradeChanges([signal, bitwarden], [signal.appId, bitwarden.appId], state);
  const next = acknowledge(state, shown, NOW);
  assert.equal(next.seenAt, '2026-11-10');
  assert.deepEqual(pendingGradeChanges([signal, bitwarden], [signal.appId, bitwarden.appId], next), []);
  // Un nouveau changement de la même app reste signalé
  const again = { ...signal, grade: 'D', previousGrade: 'B', date: '2026-11-09' };
  assert.equal(pendingGradeChanges([again], [signal.appId], next).length, 1);
});

test('acknowledge oublie les clés trop anciennes pour revenir de l\'API', () => {
  const state = { seenAt: '2026-09-01', ack: [changeKey({ ...other, date: '2026-09-02' })] };
  const next = acknowledge(state, [bitwarden], NOW);
  assert.deepEqual(next.ack, [changeKey(bitwarden)]);
});

test('sinceForState relit quelques jours avant la dernière visite', () => {
  assert.equal(LOOKBACK_DAYS, 14);
  assert.equal(sinceForState({ seenAt: '2026-11-10' }), '2026-10-27');
  assert.equal(sinceForState(null, NOW), '2026-10-27');
});
