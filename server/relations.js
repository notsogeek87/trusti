/**
 * Calcul des relations « alternatives » / « remplace » entre applications.
 *
 * Fonction pure (aucun accès base) pour pouvoir être testée.
 *
 * Règles :
 * 1. Les relations manuelles (table app_relations) passent en premier, puis
 *    les relations automatiques sont ajoutées (sans doublon).
 * 2. Relations automatiques : une alternative à X est une app de la MÊME
 *    catégorie, notée A, B ou C (jamais D/E) et strictement mieux notée que X.
 *    Une note D n'est donc jamais proposée comme alternative à une note E.
 * 3. « Remplace » est le miroir : X remplace Y si Y a X comme alternative.
 * 4. Aucune relation automatique dans les catégories où deux apps ne sont pas
 *    substituables (composants système, outils constructeur, jeux, shopping,
 *    utilitaires, personnalisation) : meilleure note ≠ même fonction.
 */

const GRADE_ORDER = { A: 1, B: 2, C: 3, D: 4, E: 5 };
const RECOMMENDABLE = new Set(['A', 'B', 'C']);

// Catégories exactes sans alternatives automatiques.
const NO_AUTO_CATEGORIES = new Set([
  'Jeux',
  'Shopping',
  'Utilitaires',
  'Personnalisation',
]);

// Préfixes de catégories sans alternatives automatiques
// (« Système Android », « Outils Samsung », « Outils / Transfert », « Services publics / … », « Jeux / … »).
const NO_AUTO_PREFIXES = ['Système', 'Outils', 'Services', 'Jeux /'];

export function allowsAutoAlternatives(category) {
  if (!category) return false;
  if (NO_AUTO_CATEGORIES.has(category)) return false;
  return !NO_AUTO_PREFIXES.some((prefix) => category.startsWith(prefix));
}

function pushUnique(list, id) {
  if (!list.includes(id)) list.push(id);
}

/**
 * @param {Array<{id: string|number, category: string, trusti_score: string}>} apps
 * @param {Array<{app_id: string, related_app_id: string, relation_type: string}>} manualRows
 * @returns {Map<string, {alternativeAppIds: string[], replacesAppIds: string[]}>}
 */
export function computeRelations(apps, manualRows = []) {
  const byCategory = new Map();
  const known = new Set();
  for (const app of apps) {
    known.add(String(app.id));
    const list = byCategory.get(app.category) || [];
    list.push(app);
    byCategory.set(app.category, list);
  }

  const relations = new Map();
  for (const app of apps) {
    relations.set(String(app.id), { alternativeAppIds: [], replacesAppIds: [] });
  }

  // 1. Relations manuelles d'abord
  for (const row of manualRows) {
    const from = String(row.app_id);
    const to = String(row.related_app_id);
    if (!known.has(from) || !known.has(to) || from === to) continue;
    const entry = relations.get(from);
    if (row.relation_type === 'alternative') pushUnique(entry.alternativeAppIds, to);
    else if (row.relation_type === 'replaces') pushUnique(entry.replacesAppIds, to);
  }

  // 2. Relations automatiques (même catégorie, alternative notée A/B/C et meilleure)
  for (const [category, peers] of byCategory) {
    if (!allowsAutoAlternatives(category)) continue;
    for (const app of peers) {
      const appValue = GRADE_ORDER[app.trusti_score] || 999;
      for (const peer of peers) {
        if (peer === app) continue;
        if (!RECOMMENDABLE.has(peer.trusti_score)) continue;
        const peerValue = GRADE_ORDER[peer.trusti_score] || 999;
        if (peerValue >= appValue) continue;
        // peer est une alternative à app, et app est « remplacée » par peer
        pushUnique(relations.get(String(app.id)).alternativeAppIds, String(peer.id));
        pushUnique(relations.get(String(peer.id)).replacesAppIds, String(app.id));
      }
    }
  }

  return relations;
}
