import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSuggestion, suggestionKey, SUGGESTION_LIMITS } from '../../server/toolSuggestion.js';

test('clé de regroupement insensible à la casse, aux accents et à la ponctuation', () => {
  assert.equal(suggestionKey('  Microsoft   Visio '), 'microsoft visio');
  assert.equal(suggestionKey('Évernote!'), 'evernote');
  assert.equal(suggestionKey('Pôle-Emploi'), suggestionKey('pole emploi'));
});

test('suggestion valide, site complété en https', () => {
  const r = validateSuggestion({ name: ' Axonaut ', website: 'axonaut.com', comment: '  CRM  français ' });
  assert.equal(r.ok, true);
  assert.deepEqual(r.value, { nameKey: 'axonaut', name: 'Axonaut', website: 'https://axonaut.com/', comment: 'CRM français' });
});

test('champs facultatifs vides : null', () => {
  const r = validateSuggestion({ name: 'Wimi', website: '', comment: '   ' });
  assert.equal(r.value.website, null);
  assert.equal(r.value.comment, null);
});

test('nom trop court, trop long ou sans lettre ni chiffre : refusé', () => {
  assert.equal(validateSuggestion({ name: 'a' }).ok, false);
  assert.equal(validateSuggestion({ name: 'x'.repeat(SUGGESTION_LIMITS.nameMax + 1) }).ok, false);
  assert.equal(validateSuggestion({ name: '!!!' }).ok, false);
  assert.equal(validateSuggestion(null).ok, false);
  assert.equal(validateSuggestion('texte').ok, false);
});

test('site invalide ou protocole interdit : refusé', () => {
  assert.equal(validateSuggestion({ name: 'Outil', website: 'javascript:alert(1)' }).ok, false);
  assert.equal(validateSuggestion({ name: 'Outil', website: 'pas un site' }).ok, false);
  assert.equal(validateSuggestion({ name: 'Outil', website: `https://${'a'.repeat(250)}.com` }).ok, false);
});

test('commentaire tronqué et caractères de contrôle retirés', () => {
  const r = validateSuggestion({ name: 'Outil\u0000\nPro', comment: 'c'.repeat(800) });
  assert.equal(r.value.name, 'Outil Pro');
  assert.equal(r.value.comment.length, SUGGESTION_LIMITS.commentMax);
});

test('champ piège rempli : ignoré silencieusement', () => {
  const r = validateSuggestion({ name: 'Outil', company: 'robot' });
  assert.equal(r.ok, false);
  assert.equal(r.silent, true);
});
