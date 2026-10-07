import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectPasswordManagers, buildManagerSuggestions, computeHygiene } from '../../src/utils/passwordManagers.js';

test('détecte un gestionnaire par catégorie ou par package Play Store', () => {
  const byCategory = detectPasswordManagers([{ id: 1, name: 'X', category: 'Gestionnaires de Mots de Passe' }]);
  assert.equal(byCategory.dedicated.id, 1);
  const byPackage = detectPasswordManagers([{ id: 2, name: 'Dashlane', playStoreUrl: 'https://play.google.com/store/apps/details?id=com.dashlane' }]);
  assert.equal(byPackage.dedicated.id, 2);
});

test('Google Password est un gestionnaire d\'écosystème, pas un gestionnaire dédié', () => {
  const res = detectPasswordManagers([{ id: 'google-password', name: 'Google Password', category: 'Gestionnaires de Mots de Passe' }]);
  assert.equal(res.dedicated, null);
  assert.equal(res.ecosystem.id, 'google-password');
});

test('aucun gestionnaire détecté sur des apps ordinaires ou une liste vide', () => {
  assert.deepEqual(detectPasswordManagers([{ id: 3, name: 'Chat', category: 'Messagerie' }]), { dedicated: null, ecosystem: null });
  assert.deepEqual(detectPasswordManagers(undefined), { dedicated: null, ecosystem: null });
});

test('les suggestions reprennent la note du catalogue quand elle existe', () => {
  const suggestions = buildManagerSuggestions([{ name: 'bitwarden', grade: 'A', icon: 'i.png' }]);
  assert.equal(suggestions.find(s => s.key === 'bitwarden').grade, 'A');
  assert.equal(suggestions.find(s => s.key === 'keepassdx').grade, null);
});

test('le bilan coche automatiquement la case gestionnaire', () => {
  assert.equal(computeHygiene({}, false).done, 0);
  const h = computeHygiene({ '2fa-mail': true }, true);
  assert.equal(h.done, 2);
  assert.equal(h.state.manager, true);
  assert.equal(h.pct, 40);
});
