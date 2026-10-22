import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickBestAlternative, pickRecommendedAlternative } from '../../src/utils/alternatives.js';

const olvid = { id: 'olvid', grade: 'A', popularity: 50 };
const signal = { id: 'signal', grade: 'B', popularity: 10, isTeamPick: true };
const threema = { id: 'threema', grade: 'B', popularity: 5 };

test('le choix de l\'équipe est recommandé avant la mieux notée', () => {
  assert.equal(pickBestAlternative([olvid, signal, threema]).id, 'olvid');
  assert.equal(pickRecommendedAlternative([olvid, signal, threema]).id, 'signal');
});

test('sans choix de l\'équipe, la règle meilleur grade puis popularité s\'applique', () => {
  assert.equal(pickRecommendedAlternative([threema, olvid]).id, 'olvid');
  assert.equal(pickRecommendedAlternative([]), undefined);
  assert.equal(pickRecommendedAlternative(undefined), undefined);
});
