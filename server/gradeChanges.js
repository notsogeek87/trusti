/**
 * Historique des notes TrustiScore (table `app_assessment_history`, alimentée
 * depuis le dépôt trustillm à chaque évaluation) : mise en forme pour l'API.
 *
 * Fonctions pures, sans accès base : testables seules (tests/server/gradeChanges.test.js).
 * Le champ `summary` de l'historique n'est jamais renvoyé : ce sont des notes
 * de travail internes, pas un texte destiné au public.
 */

const GRADES = ['A', 'B', 'C', 'D', 'E'];
const DAY_MS = 24 * 60 * 60 * 1000;

// Fenêtre par défaut et fenêtre maximale d'une requête « changements depuis ».
export const DEFAULT_WINDOW_DAYS = 90;
export const MAX_WINDOW_DAYS = 365;

const isGrade = (g) => GRADES.includes(g);
const toDay = (value) => (value ? String(value).slice(0, 10) : null);
const isoDay = (date) => date.toISOString().slice(0, 10);

/**
 * Valide le paramètre `since` (AAAA-MM-JJ). Absent : il y a 90 jours.
 * Trop ancien : ramené à 365 jours (borne la taille de la réponse).
 * @returns {string|null} date AAAA-MM-JJ, ou null si le paramètre est invalide
 */
export function parseSince(raw, now = new Date()) {
  const oldest = isoDay(new Date(now.getTime() - MAX_WINDOW_DAYS * DAY_MS));
  if (raw === undefined || raw === null || raw === '' || raw === 'true') {
    return isoDay(new Date(now.getTime() - DEFAULT_WINDOW_DAYS * DAY_MS));
  }
  const value = String(raw);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || isoDay(parsed) !== value) return null;
  return value < oldest ? oldest : value;
}

/**
 * Lignes d'historique (une ligne par évaluation) -> un changement net par app.
 * Plusieurs évaluations depuis `since` : de la note d'avant la première à la
 * note de la dernière. Retour à la note de départ : aucun changement.
 *
 * @param {Array<{app_id, name, grade, previous_grade, assessed_at}>} rows
 * @returns {Array<{appId: string, name: string, previousGrade: string, grade: string, date: string}>}
 *   du plus récent au plus ancien
 */
export function collapseGradeChanges(rows) {
  const byApp = new Map();
  const sorted = (rows || [])
    .filter(r => r && r.app_id && isGrade(r.grade))
    .slice()
    .sort((a, b) => String(toDay(a.assessed_at)).localeCompare(String(toDay(b.assessed_at))));

  for (const row of sorted) {
    const appId = String(row.app_id);
    const entry = byApp.get(appId);
    if (!entry) {
      // Première évaluation sans note précédente : création de fiche, pas un changement.
      byApp.set(appId, {
        appId,
        name: row.name || appId,
        previousGrade: isGrade(row.previous_grade) ? row.previous_grade : row.grade,
        grade: row.grade,
        date: toDay(row.assessed_at),
      });
    } else {
      entry.grade = row.grade;
      entry.date = toDay(row.assessed_at);
      if (row.name) entry.name = row.name;
    }
  }

  return [...byApp.values()]
    .filter(c => c.previousGrade !== c.grade)
    .sort((a, b) => b.date.localeCompare(a.date) || a.name.localeCompare(b.name));
}

/**
 * Historique d'une app -> date de première évaluation et liste des changements.
 * @param {Array<{grade, previous_grade, assessed_at}>} rows
 * @returns {{firstAssessedAt: string|null, changes: Array<{date: string, from: string, to: string}>}}
 *   changements du plus récent au plus ancien
 */
export function buildGradeTimeline(rows) {
  const sorted = (rows || [])
    .filter(r => r && isGrade(r.grade) && r.assessed_at)
    .slice()
    .sort((a, b) => String(toDay(a.assessed_at)).localeCompare(String(toDay(b.assessed_at))));
  if (sorted.length === 0) return { firstAssessedAt: null, changes: [] };

  const changes = [];
  let current = isGrade(sorted[0].previous_grade) ? sorted[0].previous_grade : null;
  for (const row of sorted) {
    if (current && row.grade !== current) {
      changes.push({ date: toDay(row.assessed_at), from: current, to: row.grade });
    }
    current = row.grade;
  }
  return { firstAssessedAt: toDay(sorted[0].assessed_at), changes: changes.reverse() };
}
