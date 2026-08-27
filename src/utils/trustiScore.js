import { GRADES } from '../constants/grades';

// Poids numérique par note, du meilleur (A) au pire (E), pour dériver une
// note globale à partir d'un ensemble d'apps (ex: apps trouvées sur le
// téléphone lors d'un scan).
const GRADE_POINTS = { A: 4, B: 3, C: 2, D: 1, E: 0 };

/**
 * Calcule, pour une liste d'apps (avec un champ `grade`), le nombre d'apps
 * par note ainsi qu'une note globale déduite de la moyenne des notes
 * individuelles (arrondie à la note la plus proche).
 */
export function computeTrustiSummary(apps) {
  const counts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  let totalPoints = 0;
  let scored = 0;

  apps.forEach(app => {
    const grade = app?.grade;
    if (counts[grade] === undefined) return;
    counts[grade] += 1;
    totalPoints += GRADE_POINTS[grade];
    scored += 1;
  });

  let overallGrade = null;
  if (scored > 0) {
    const average = totalPoints / scored;
    const rounded = Math.round(average);
    overallGrade = GRADES[GRADES.length - 1 - rounded];
  }

  return { counts, total: scored, overallGrade };
}
