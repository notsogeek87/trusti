/**
 * Mise en forme des apps lues en base et petits utilitaires purs
 * (aucune requête SQL ni appel réseau : testables directement).
 */
import { formatTeamPick } from '../team-pick.js';

/**
 * Helper: Extraire le package ID depuis une URL Play Store, ou accepter
 * directement un package name saisi à la main (ex: "com.example.app")
 */
export function extractPackageId(playStoreUrl) {
  if (!playStoreUrl) return null;
  const trimmed = playStoreUrl.trim();
  const match = trimmed.match(/[?&]id=([a-zA-Z0-9._]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(trimmed)) {
    return trimmed;
  }
  return null;
}

/**
 * Helper: Construire l'URL Play Store depuis un package name
 */
export function buildPlayStoreUrl(packageName) {
  if (!packageName) return null;
  return `https://play.google.com/store/apps/details?id=${packageName}`;
}

/**
 * Échappe les jokers LIKE (% et _) saisis par l'utilisateur pour qu'ils
 * soient cherchés littéralement (backslash = caractère d'échappement par défaut).
 */
export function escapeLike(value) {
  return String(value).replace(/[\\%_]/g, '\\$&');
}

/**
 * Calculer le type d'application basé sur le trustiScore
 * @param {string} trustiScore - Score A, B, C, D ou E
 * @returns {string} 'trusti' (A/B/C), 'star' (D/E), ou 'regular'
 */
export function calculateAppType(trustiScore) {
  if (['A', 'B', 'C'].includes(trustiScore)) return 'trusti';
  if (['D', 'E'].includes(trustiScore)) return 'star';
  return 'regular';
}

/**
 * Formater une application depuis la DB.
 *
 * Purement synchrone : aucune requête SQL ni appel réseau ici. Le nom,
 * l'icône, l'URL App Store et l'URL F-Droid sont désormais résolus une
 * seule fois à l'écriture (voir enrichFromPlayStore, appelé par createApp
 * / updateApp) et simplement lus depuis les colonnes en base. Les relations
 * (alternatives/remplace) sont calculées en une seule requête batchée par
 * l'appelant (voir buildRelationsMap) plutôt qu'avec une requête par app.
 */
export function formatAppFromDB(app, relations = { alternativeAppIds: [], replacesAppIds: [] }) {
  const trustiScore = app.trusti_score;
  const appType = app.app_type || calculateAppType(trustiScore);

  // Construire une URL Play Store valide si nécessaire (repli synchrone,
  // sans appel réseau)
  let playStoreUrl = app.play_store_url;
  const packageName = extractPackageId(playStoreUrl);
  if (playStoreUrl && packageName && !playStoreUrl.startsWith('https://play.google.com')) {
    playStoreUrl = buildPlayStoreUrl(packageName);
  }

  // Récupérer les permissions depuis la base de données
  let permissions = typeof app.permissions === 'string'
    ? JSON.parse(app.permissions)
    : (Array.isArray(app.permissions) ? app.permissions : []);

  return {
    id: app.id,
    name: app.name,
    trustiScore: trustiScore,
    grade: app.grade,
    category: app.category,
    icon: app.icon,
    color: app.color,
    reason: app.reason,
    playStoreUrl: playStoreUrl, // URL Play Store vérifiée/construite
    appleStoreUrl: app.apple_store_url, // URL App Store (résolue à l'écriture)
    fDroidUrl: app.f_droid_url, // URL F-Droid (résolue à l'écriture, TrustiApps A/B/C)
    githubUrl: app.github_url,
    otherStoreUrl: app.other_store_url,
    website: app.website,
    description: app.description,
    developer: app.developer,
    license: app.license,
    isOpenSource: app.is_open_source,
    isEuropean: app.is_european,
    jurisdiction: app.jurisdiction,
    appType: appType,
    showInAwards: app.show_in_awards !== 0,
    showInOnboarding: app.show_in_onboarding !== 0,
    ...formatTeamPick(app),
    popularity: app.popularity ?? 9999,
    privacyFeatures: typeof app.privacy_features === 'string' 
      ? JSON.parse(app.privacy_features) 
      : app.privacy_features,
    alternativeAppIds: relations.alternativeAppIds,
    replacesAppIds: relations.replacesAppIds,
    permissions: permissions, // Permissions Android récupérées depuis Play Store
    createdAt: app.created_at,
    updatedAt: app.updated_at
  };
}
