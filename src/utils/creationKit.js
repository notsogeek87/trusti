/**
 * Assistant « Créer mon organisation » : construction du kit de démarrage.
 * Fonctions pures, sans React ni réseau : testées dans tests/technical/creationKit.test.js.
 */
import { CREATION_SIZES, KIT_NEEDS, KIT_STEPS } from '../constants/creationKits.js';

/**
 * Kit recommandé pour des réponses données.
 * @param {{type: string, size: string, approach: string}} answers
 * @param {Map<string, object>} appsById catalogue « usage pro » indexé par id
 * @returns {{steps: Array<{step: string, items: object[]}>, apps: object[]}}
 *   items : { need, app|null, why, cost, note } ; apps : apps uniques du kit (pour la note)
 */
export function buildStarterKit({ type, size, approach }, appsById) {
  const level = CREATION_SIZES.find(s => s.id === size)?.level ?? 1;
  const items = [];
  for (const need of KIT_NEEDS) {
    if (need.minSize > level) continue;
    if (need.types && !need.types.includes(type)) continue;
    if (need.approaches && !need.approaches.includes(approach)) continue;
    const pick = need.picks[approach];
    if (!pick) continue;
    if (pick.note) {
      items.push({ need, app: null, note: pick.note });
      continue;
    }
    const app = appsById.get(String(pick.appId));
    if (!app) continue; // outil retiré du catalogue : on n'affiche pas une recommandation vide
    items.push({ need, app, why: pick.why, cost: pick.cost });
  }

  const steps = KIT_STEPS
    .map(step => ({ step, items: items.filter(i => i.need.step === step) }))
    .filter(s => s.items.length > 0);

  const seen = new Set();
  const apps = [];
  for (const item of items) {
    if (item.app && !seen.has(item.app.id)) {
      seen.add(item.app.id);
      apps.push(item.app);
    }
  }
  return { steps, apps };
}

/**
 * Sélection à enregistrer dans « Évaluer mon organisation ».
 * - 'replace' : la sélection devient celle du kit (criticités remises à zéro)
 * - 'merge'   : les outils du kit s'ajoutent à la sélection existante, rien n'est perdu
 * @param {{ids: string[], criticality: object, orgName?: string}|null} saved état actuel
 * @param {string[]} kitIds
 * @param {'replace'|'merge'} mode
 */
export function mergeKitIntoSelection(saved, kitIds, mode) {
  const kit = kitIds.map(String);
  if (mode === 'merge' && saved) {
    const ids = [...saved.ids];
    for (const id of kit) if (!ids.includes(id)) ids.push(id);
    return { ids, criticality: saved.criticality || {}, orgName: saved.orgName || '' };
  }
  return { ids: [...new Set(kit)], criticality: {}, orgName: saved?.orgName || '' };
}
