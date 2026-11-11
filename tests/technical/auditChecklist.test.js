import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AUDIT_QUESTIONS, AUDIT_THEMES, AUDIT_WEIGHTS } from '../../src/constants/auditChecklist.js';
import { ORG_PROFILES } from '../../src/constants/orgProfiles.js';
import { ORG_HELP, helpForProfile } from '../../src/constants/orgHelp.js';
import { questionsForProfile, sanitizeAuditAnswers, computeAuditResult } from '../../src/utils/auditChecklist.js';

const profileIds = new Set(ORG_PROFILES.map(p => p.id));

test('questions : ids uniques, thème, poids, réponse à risque et recommandation valides', () => {
  const ids = AUDIT_QUESTIONS.map(q => q.id);
  assert.equal(ids.length, new Set(ids).size);
  for (const q of AUDIT_QUESTIONS) {
    assert.ok(AUDIT_THEMES.includes(q.theme), q.id);
    assert.ok(AUDIT_WEIGHTS[q.weight], q.id);
    assert.ok(['oui', 'non'].includes(q.riskAnswer), q.id);
    assert.ok(q.label.endsWith('?'), q.id);
    assert.ok(q.recommendation, q.id);
    for (const p of q.profiles || []) assert.ok(profileIds.has(p), `${q.id} : profil ${p}`);
  }
});

test('questions propres aux mairies : DPO et adresses des élus seulement pour les collectivités', () => {
  const mairie = questionsForProfile('collectivite').map(q => q.id);
  const entreprise = questionsForProfile('entreprise').map(q => q.id);
  const sansProfil = questionsForProfile(null).map(q => q.id);
  assert.ok(mairie.includes('dpo') && mairie.includes('elus-adresse-perso'));
  assert.ok(!entreprise.includes('dpo'));
  assert.ok(!sansProfil.includes('donnees-sensibles'));
  assert.ok(sansProfil.includes('mfa'));
});

test('résultat : risques prioritaires d\'abord, « je ne sais pas » à vérifier', () => {
  const answers = { registre: 'non', mfa: 'non', 'comptes-partages': 'non', sauvegarde: 'nsp', dpo: 'oui' };
  const result = computeAuditResult(answers, 'collectivite');
  assert.equal(result.total, questionsForProfile('collectivite').length);
  assert.equal(result.answered, 5);
  assert.deepEqual(result.risks.map(q => q.id), ['mfa', 'registre']);
  assert.deepEqual(result.unknown.map(q => q.id), ['sauvegarde']);
  assert.equal(result.okCount, 2);
});

test('une réponse à une question hors profil ne compte pas', () => {
  const result = computeAuditResult({ dpo: 'non' }, 'entreprise');
  assert.equal(result.answered, 0);
  assert.equal(result.risks.length, 0);
});

test('réponses nettoyées : valeurs et questions inconnues écartées', () => {
  assert.deepEqual(sanitizeAuditAnswers({ mfa: 'oui', dpo: 'bof', autre: 'non' }), { mfa: 'oui' });
  assert.deepEqual(sanitizeAuditAnswers(null), {});
});

test('aides : liens https, profils connus, celles du profil d\'abord', () => {
  for (const h of ORG_HELP) {
    assert.match(h.url, /^https:\/\//, h.id);
    for (const p of h.profiles || []) assert.ok(profileIds.has(p), `${h.id} : profil ${p}`);
  }
  const mairie = helpForProfile('collectivite');
  assert.equal(mairie[0].id, 'suite-territoriale');
  assert.ok(mairie.some(h => h.id === 'cybermalveillance'));
  assert.ok(!helpForProfile('entreprise').some(h => h.id === 'suite-territoriale'));
});
