import {
  PASSWORD_MANAGER_CATEGORY,
  KNOWN_MANAGER_PACKAGES,
  ECOSYSTEM_MANAGER_PATTERN,
  RECOMMENDED_MANAGERS,
  HYGIENE_CHECKS,
} from '../constants/dataHygiene.js';
import { extractPackageId } from './androidPackage.js';

const isManagerApp = (app) =>
  app?.category === PASSWORD_MANAGER_CATEGORY ||
  KNOWN_MANAGER_PACKAGES.includes(extractPackageId(app?.playStoreUrl));

/**
 * Cherche dans une liste d'apps (celles de "Mes Apps") un gestionnaire de mots
 * de passe indépendant et/ou un gestionnaire d'écosystème (Google, etc.).
 * @returns {{ dedicated: object|null, ecosystem: object|null }}
 */
export function detectPasswordManagers(apps) {
  const list = (apps || []).filter(app => app && !app.isLoadingSkeleton);
  const ecosystem = list.find(app => ECOSYSTEM_MANAGER_PATTERN.test(app.name || '') || app.id === 'google-password') || null;
  const dedicated = list.find(app => app !== ecosystem && isManagerApp(app)) || null;
  return { dedicated, ecosystem };
}

/**
 * Gestionnaires à proposer : les recommandés, enrichis de la note du
 * catalogue Trusti quand l'app y figure (recherche par nom).
 */
export function buildManagerSuggestions(catalogApps) {
  return RECOMMENDED_MANAGERS.map(manager => {
    const fromCatalog = (catalogApps || []).find(
      app => (app?.name || '').toLowerCase() === manager.name.toLowerCase()
    );
    return { ...manager, grade: fromCatalog?.grade || null, icon: fromCatalog?.icon || null };
  });
}

/**
 * Bilan d'hygiène : nombre de cases cochées / total. La case "manager" est
 * cochée si un gestionnaire est détecté ou déclaré manuellement.
 */
export function computeHygiene(checks, managerDetected) {
  const state = {};
  HYGIENE_CHECKS.forEach(item => {
    state[item.id] = item.auto && managerDetected ? true : !!checks?.[item.id];
  });
  const done = Object.values(state).filter(Boolean).length;
  const total = HYGIENE_CHECKS.length;
  return { state, done, total, pct: Math.round((done / total) * 100) };
}
