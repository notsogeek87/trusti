/**
 * Calcul des relations « alternative » / « remplace » entre apps.
 *
 * Deux sources, réunies :
 *  1. la règle par catégorie : les apps de la même catégorie mieux notées sont des alternatives ;
 *  2. les liens saisis à la main (table `app_relations`, type `alternative`) : ils ajoutent
 *     des alternatives d'une autre catégorie (Miro → CryptPad, Teams → Tchap…).
 *
 * Dans les deux cas, une alternative doit être strictement mieux notée : un lien saisi
 * devenu obsolète (alternative moins bien notée depuis) est ignoré, pas supprimé.
 * Les liens saisis s'ajoutent sans rien retirer : ils sont incomplets (audit du
 * 2026-11-10, docs/analyses/audit-alternatives-2026-11-10.md), la règle par catégorie
 * reste la base. Le classement (choix de l'équipe, note, popularité) se fait côté app.
 *
 * `replacesAppIds` est l'inverse exact de `alternativeAppIds` : B remplace A si et seulement
 * si B est une alternative de A. La fiche, « Mes Apps » et la migration guidée restent ainsi
 * cohérentes.
 *
 * Fonction pure, testée dans tests/server/relations.test.js.
 */

const SCORE_ORDER = { A: 1, B: 2, C: 3, D: 4, E: 5 };
const rank = (grade) => SCORE_ORDER[grade] || 999;

/**
 * @param {Array<{id, category, trusti_score}>} apps toutes les apps
 * @param {Array<{app_id, related_app_id}>} [curated] liens « alternative » saisis à la main
 * @returns {Map<string, {alternativeAppIds: string[], replacesAppIds: string[]}>}
 */
export function computeRelations(apps, curated = []) {
  const byId = new Map();
  const byCategory = new Map();
  for (const app of apps || []) {
    const id = String(app.id);
    byId.set(id, app);
    const list = byCategory.get(app.category) || [];
    list.push(app);
    byCategory.set(app.category, list);
  }

  const alternatives = new Map();
  for (const [id, app] of byId) {
    const set = new Set();
    for (const peer of byCategory.get(app.category) || []) {
      if (String(peer.id) !== id && rank(peer.trusti_score) < rank(app.trusti_score)) set.add(String(peer.id));
    }
    alternatives.set(id, set);
  }

  for (const link of curated || []) {
    const from = String(link.app_id);
    const to = String(link.related_app_id);
    const app = byId.get(from);
    const alt = byId.get(to);
    if (!app || !alt || from === to) continue;
    if (rank(alt.trusti_score) < rank(app.trusti_score)) alternatives.get(from).add(to);
  }

  const result = new Map();
  for (const id of byId.keys()) result.set(id, { alternativeAppIds: [], replacesAppIds: [] });
  for (const [id, set] of alternatives) {
    for (const altId of set) {
      result.get(id).alternativeAppIds.push(altId);
      result.get(altId).replacesAppIds.push(id);
    }
  }
  return result;
}
