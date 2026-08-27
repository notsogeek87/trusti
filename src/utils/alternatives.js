// Règle unique pour choisir "l'" alternative recommandée par défaut quand
// plusieurs apps de meilleur grade remplacent la même app (ex: Facebook a
// souvent plusieurs alternatives A/B dans la même catégorie). Utilisée
// partout où une seule alternative doit être mise en avant : "Mes Apps"
// (useAppManagement), l'onboarding et le scan (OnboardingApps).
//
// Priorité : meilleur grade d'abord (A > B > C), puis la plus populaire à
// grade égal (popularity = rang, plus petit = plus populaire). Choisir
// simplement "la première trouvée dans le tableau" n'est pas déterministe :
// l'ordre dépend de la pagination/du chargement de la liste d'apps.
const GRADE_PRIORITY = { A: 1, B: 2, C: 3, D: 4, E: 5 };

export function pickBestAlternative(candidates) {
  if (!candidates || candidates.length === 0) return undefined;
  return candidates.slice().sort((a, b) => {
    const gradeDiff = (GRADE_PRIORITY[a.grade] || 999) - (GRADE_PRIORITY[b.grade] || 999);
    if (gradeDiff !== 0) return gradeDiff;
    return (a.popularity ?? 9999) - (b.popularity ?? 9999);
  })[0];
}
