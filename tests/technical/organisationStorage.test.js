import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  isEmptyOrganisationState,
  loadOrganisationState,
  saveOrganisationState,
  clearOrganisationState,
} from '../../src/utils/organisationStorage.js';

const store = new Map();
globalThis.window = {
  localStorage: {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: k => store.delete(k),
  },
};

beforeEach(() => store.clear());

test('isEmptyOrganisationState : vide seulement sans outil, nom ni profil', () => {
  assert.equal(isEmptyOrganisationState([], {}), true);
  assert.equal(isEmptyOrganisationState([], { orgName: '   ' }), true);
  assert.equal(isEmptyOrganisationState(['a'], {}), false);
  assert.equal(isEmptyOrganisationState([], { orgName: 'Mairie' }), false);
  assert.equal(isEmptyOrganisationState([], { profile: 'association' }), false);
});

test('une organisation enregistrée se recharge', () => {
  saveOrganisationState(['a', 'b'], { a: 'vital' }, { orgName: 'Mairie', profile: 'collectivite' });
  const saved = loadOrganisationState();
  assert.deepEqual(saved.ids, ['a', 'b']);
  assert.equal(saved.orgName, 'Mairie');
});

test('supprimer une organisation efface le stockage', () => {
  saveOrganisationState(['a'], {}, { orgName: 'Mairie' });
  clearOrganisationState();
  assert.equal(loadOrganisationState(), null);
});

test('enregistrer un état vide efface l\'entrée au lieu de la réécrire', () => {
  saveOrganisationState(['a'], {}, { orgName: 'Mairie' });
  saveOrganisationState([], {}, { orgName: '', profile: null });
  assert.equal(store.size, 0);
  assert.equal(loadOrganisationState(), null);
});
