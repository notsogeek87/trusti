/**
 * Catégories demandées par une étape de l'onboarding -> catégories à inclure.
 *
 * Les étapes de l'onboarding (src/components/OnboardingApps.jsx) restent générales
 * (« Messagerie », « Streaming Vidéo »…). Certaines de ces catégories ont été
 * découpées en sous-catégories « Parent / Détail » pour mieux calculer les
 * alternatives (audit du 2026-11-10) : l'étape doit continuer à montrer leurs apps.
 *
 * Seuls les parents découpés à cette occasion sont élargis : d'autres sous-catégories
 * existantes (« Finance / Crypto »…) n'ont jamais été dans l'onboarding et n'y entrent pas.
 *
 * Fonction pure, testée dans tests/server/onboardingCategories.test.js.
 */
export const ONBOARDING_SPLIT_PARENTS = [
  'Messagerie',
  'Téléphone & SMS',
  'Réseaux sociaux',
  'Streaming Vidéo',
  'Email',
  'Transport & Mobilité',
];

/** Parents dont les sous-catégories « Parent / … » sont à inclure pour ces catégories demandées. */
export function onboardingSubcategoryParents(categories) {
  return (categories || []).filter(c => ONBOARDING_SPLIT_PARENTS.includes(c));
}

/** true si `category` est demandée, directement ou comme sous-catégorie d'un parent découpé. */
export function matchesOnboardingCategories(category, categories) {
  if (!category) return false;
  if ((categories || []).includes(category)) return true;
  const parent = String(category).split(' / ')[0];
  return parent !== category && onboardingSubcategoryParents(categories).includes(parent);
}
