// Palmarès : un podium par catégorie, pas un catalogue bis.
// Seules les apps notées A ou B sont recommandées ; dans chaque catégorie
// principale, on garde les AWARDS_PER_CATEGORY meilleures (meilleur grade,
// puis la plus populaire, puis ordre alphabétique pour rester déterministe).
import { GRADE_PRIORITY } from './alternatives.js';

export const AWARDS_GRADES = ['A', 'B'];
export const AWARDS_PER_CATEGORY = 3;

const gradeOf = (app) => app.trustiScore || app.grade;

export function compareAwardApps(a, b) {
  const gradeDiff = (GRADE_PRIORITY[gradeOf(a)] || 999) - (GRADE_PRIORITY[gradeOf(b)] || 999);
  if (gradeDiff !== 0) return gradeDiff;
  const popDiff = (a.popularity ?? 9999) - (b.popularity ?? 9999);
  if (popDiff !== 0) return popDiff;
  return (a.name || '').localeCompare(b.name || '', 'fr');
}

/**
 * Regroupe les apps du Palmarès en podiums par catégorie principale.
 * @param {Array<Object>} apps
 * @param {(category: string) => string} normalizeCategory
 * @param {number} [perCategory]
 * @returns {Array<{category: string, apps: Array<Object>}>} trié par catégorie
 */
export function buildAwardsPodiums(apps, normalizeCategory, perCategory = AWARDS_PER_CATEGORY) {
  const groups = new Map();
  for (const app of apps || []) {
    if (!AWARDS_GRADES.includes(gradeOf(app))) continue;
    const category = normalizeCategory(app.category);
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(app);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'fr'))
    .map(([category, list]) => ({
      category,
      apps: list.slice().sort(compareAwardApps).slice(0, perCategory)
    }));
}
