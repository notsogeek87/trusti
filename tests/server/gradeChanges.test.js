import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSince, collapseGradeChanges, buildGradeTimeline } from '../../server/gradeChanges.js';

const NOW = new Date('2026-11-10T12:00:00Z');

test('parseSince : 90 jours par défaut', () => {
  assert.equal(parseSince(undefined, NOW), '2026-08-12');
  assert.equal(parseSince('', NOW), '2026-08-12');
});

test('parseSince : date valide gardée, trop ancienne ramenée à 365 jours', () => {
  assert.equal(parseSince('2026-11-01', NOW), '2026-11-01');
  assert.equal(parseSince('2020-01-01', NOW), '2025-11-10');
});

test('parseSince : rejette les formats invalides', () => {
  assert.equal(parseSince('01/11/2026', NOW), null);
  assert.equal(parseSince('2026-02-30', NOW), null);
  assert.equal(parseSince("2026-11-01' OR 1=1", NOW), null);
});

test('collapseGradeChanges : nouvelle fiche sans note précédente ignorée', () => {
  const rows = [{ app_id: 'a', name: 'A', grade: 'B', previous_grade: null, assessed_at: '2026-11-02' }];
  assert.deepEqual(collapseGradeChanges(rows), []);
});

test('collapseGradeChanges : réévaluation inchangée ignorée', () => {
  const rows = [{ app_id: 'a', name: 'A', grade: 'B', previous_grade: 'B', assessed_at: '2026-11-02' }];
  assert.deepEqual(collapseGradeChanges(rows), []);
});

test('collapseGradeChanges : plusieurs évaluations -> un changement net', () => {
  const rows = [
    { app_id: 'w', name: 'WhatsApp', grade: 'D', previous_grade: 'C', assessed_at: '2026-11-01' },
    { app_id: 'w', name: 'WhatsApp', grade: 'E', previous_grade: 'D', assessed_at: '2026-11-05' },
    { app_id: 'x', name: 'Xapp', grade: 'B', previous_grade: 'C', assessed_at: '2026-11-03' },
    { app_id: 'y', name: 'Yapp', grade: 'C', previous_grade: 'B', assessed_at: '2026-11-02' },
    { app_id: 'y', name: 'Yapp', grade: 'B', previous_grade: 'C', assessed_at: '2026-11-04' },
  ];
  assert.deepEqual(collapseGradeChanges(rows), [
    { appId: 'w', name: 'WhatsApp', previousGrade: 'C', grade: 'E', date: '2026-11-05' },
    { appId: 'x', name: 'Xapp', previousGrade: 'C', grade: 'B', date: '2026-11-03' },
  ]);
});

test('collapseGradeChanges : tolère les entrées vides ou invalides', () => {
  assert.deepEqual(collapseGradeChanges(null), []);
  assert.deepEqual(collapseGradeChanges([null, { app_id: 'a', grade: 'Z' }]), []);
});

test('buildGradeTimeline : changements du plus récent au plus ancien', () => {
  const rows = [
    { grade: 'D', previous_grade: 'C', assessed_at: '2026-10-08' },
    { grade: 'D', previous_grade: 'D', assessed_at: '2026-10-20' },
    { grade: 'B', previous_grade: 'D', assessed_at: '2026-11-03' },
  ];
  assert.deepEqual(buildGradeTimeline(rows), {
    firstAssessedAt: '2026-10-08',
    changes: [
      { date: '2026-11-03', from: 'D', to: 'B' },
      { date: '2026-10-08', from: 'C', to: 'D' },
    ],
  });
});

test('buildGradeTimeline : première évaluation sans note précédente', () => {
  assert.deepEqual(buildGradeTimeline([{ grade: 'A', previous_grade: null, assessed_at: '2026-11-09' }]), {
    firstAssessedAt: '2026-11-09', changes: [],
  });
  assert.deepEqual(buildGradeTimeline([]), { firstAssessedAt: null, changes: [] });
});
