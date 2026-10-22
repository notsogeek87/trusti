import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatTeamPick } from '../../server/database/team-pick.js';

test('une app sans colonnes « choix de l\'équipe » n\'est pas un choix', () => {
  assert.deepEqual(formatTeamPick({}), { isTeamPick: false, teamPickReason: null });
  assert.deepEqual(formatTeamPick(undefined), { isTeamPick: false, teamPickReason: null });
});

test('expose la raison nettoyée du choix de l\'équipe', () => {
  assert.deepEqual(
    formatTeamPick({ is_team_pick: true, team_pick_reason: '  Chiffré de bout en bout ' }),
    { isTeamPick: true, teamPickReason: 'Chiffré de bout en bout' }
  );
});

test('raison vide ou absente : choix sans raison', () => {
  assert.deepEqual(formatTeamPick({ is_team_pick: true, team_pick_reason: '   ' }), { isTeamPick: true, teamPickReason: null });
  assert.deepEqual(formatTeamPick({ is_team_pick: true, team_pick_reason: null }), { isTeamPick: true, teamPickReason: null });
});

test('ignore une raison restée sur une app qui n\'est plus le choix', () => {
  assert.deepEqual(
    formatTeamPick({ is_team_pick: false, team_pick_reason: 'ancienne raison' }),
    { isTeamPick: false, teamPickReason: null }
  );
});
