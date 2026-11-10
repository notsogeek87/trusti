import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeApp,
  normalizeApiApps,
  buildAlternativeInfo,
  buildMyAppsList,
  computeFilteredApps,
} from '../../src/utils/appListing.js';
import { TABS } from '../../src/constants/tabs.js';

const whatsapp = { id: '1', name: 'WhatsApp', grade: 'D', category: 'Messagerie' };
const signal = { id: '2', name: 'Signal', grade: 'A', category: 'Messagerie', replacesAppIds: ['1'] };
const olvid = { id: '3', name: 'Olvid', grade: 'B', category: 'Messagerie', replacesAppId: '1' };
const tiktok = { id: '4', name: 'TikTok', grade: 'E', category: 'Réseaux sociaux' };

test('normalizeApp convertit les IDs en chaînes', () => {
  assert.deepEqual(
    normalizeApp({ id: 7, replacesAppId: 3, replacesAppIds: [1, 2] }),
    { id: '7', replacesAppId: '3', replacesAppIds: ['1', '2'] }
  );
  assert.deepEqual(normalizeApiApps({ success: false, apps: [{ id: 1 }] }), []);
  assert.deepEqual(normalizeApiApps(null), []);
});

test("l'alternative déjà utilisée passe devant, une meilleure est signalée à part", () => {
  const pool = [signal, olvid];
  assert.equal(buildAlternativeInfo(tiktok, pool, new Set()), null);

  const notUsed = buildAlternativeInfo(whatsapp, pool, new Set(['1']));
  assert.equal(notUsed.alternative, 'Signal');
  assert.equal(notUsed.alternativeAdopted, false);

  const used = buildAlternativeInfo(whatsapp, pool, new Set(['1', '3']));
  assert.equal(used.alternative, 'Olvid');
  assert.equal(used.alternativeAdopted, true);
  assert.deepEqual(used.betterAlternative, { id: '2', name: 'Signal', grade: 'A' });
});

test('« Mes Apps » : cartes de chargement, alternatives, tri du pire au meilleur', () => {
  const list = buildMyAppsList({
    myApps: new Set(['1', '2', '9']),
    myAppsData: [whatsapp, signal],
    catalogApps: [olvid],
    isLoadingMyApps: false,
  });
  assert.deepEqual(list.map(a => a.id), ['1', '9', '2']);
  assert.equal(list[0].alternative, 'Signal');
  assert.equal(list[0].alternativeAdopted, true);
  assert.equal(list[1].isLoadingSkeleton, true);
});

test('« Mes Apps » : alternative connue mais pas encore chargée = indicateur de chargement', () => {
  const [app] = buildMyAppsList({
    myApps: new Set(['4']),
    myAppsData: [{ ...tiktok, alternativeAppIds: ['99'] }],
    catalogApps: [],
    isLoadingMyApps: false,
  });
  assert.equal(app.isLoadingAlternative, true);
});

const base = {
  searchTerm: '',
  selectedCategory: 'Toutes',
  catalogApps: [tiktok, signal, whatsapp],
  searchResults: [],
  awardsApps: [signal],
  myApps: new Set(),
  myAppsData: [],
  isLoadingMyApps: false,
};

test("catalogue « Toutes » : l'ordre du serveur est conservé ; une catégorie trie du meilleur au pire", () => {
  const ids = (list) => list.map(a => a.id);
  assert.deepEqual(ids(computeFilteredApps({ ...base, activeTab: TABS.APPLICATIONS })), ['4', '2', '1']);
  assert.deepEqual(
    ids(computeFilteredApps({ ...base, activeTab: TABS.APPLICATIONS, selectedCategory: 'Messagerie' })),
    ['2', '1', '4']
  );
});

test('recherche : filtrée selon l\'onglet', () => {
  const searching = { ...base, searchTerm: 'a', searchResults: [whatsapp, signal, { ...olvid, showInAwards: true }] };
  assert.deepEqual(
    computeFilteredApps({ ...searching, activeTab: TABS.MY_APPS, myApps: new Set(['1']) }).map(a => a.id),
    ['1']
  );
  assert.deepEqual(
    computeFilteredApps({ ...searching, activeTab: TABS.TOP_ALTERNATIVES }).map(a => a.id),
    ['3']
  );
  assert.equal(computeFilteredApps({ ...base, activeTab: TABS.TOP_ALTERNATIVES }), base.awardsApps);
});
