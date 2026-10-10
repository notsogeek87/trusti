/**
 * Contenu pédagogique "Hygiène numérique" : bonnes pratiques de gestion des
 * mots de passe, gestionnaires recommandés et cases du bilan de sécurité.
 * Textes en version unique (le mode -15 ans a été retiré).
 */

export const PASSWORD_MANAGER_CATEGORY = 'Gestionnaires de Mots de Passe';

// Gestionnaires recommandés. Les liens pointent vers les sources officielles
// (aucun lien d'affiliation) pour ne pas biaiser le TrustiScore.
export const RECOMMENDED_MANAGERS = [
  {
    key: 'bitwarden',
    name: 'Bitwarden',
    packageId: 'com.x8bit.bitwarden',
    pitch: 'Open source, synchronisé sur tous tes appareils, gratuit pour l\'essentiel.',
    url: 'https://play.google.com/store/apps/details?id=com.x8bit.bitwarden',
  },
  {
    key: 'keepassdx',
    name: 'KeePassDX',
    packageId: 'com.kunzisoft.keepass.free',
    pitch: '100 % local, sans compte : tes mots de passe restent dans un fichier que tu contrôles.',
    url: 'https://play.google.com/store/apps/details?id=com.kunzisoft.keepass.free',
  },
  {
    key: 'proton-pass',
    name: 'Proton Pass',
    packageId: 'proton.android.pass',
    pitch: 'Chiffré de bout en bout, éditeur suisse, intégré à l\'écosystème Proton.',
    url: 'https://play.google.com/store/apps/details?id=proton.android.pass',
  },
];

// Packages de gestionnaires connus (en plus de la catégorie du catalogue),
// pour reconnaître aussi ceux que Trusti ne note pas encore.
export const KNOWN_MANAGER_PACKAGES = [
  ...RECOMMENDED_MANAGERS.map(m => m.packageId),
  'com.onepassword.android',
  'com.agilebits.onepassword',
  'com.dashlane',
  'com.lastpass.lpandroid',
  'com.keepersecurity.passwordmanager',
  'org.keepassxc',
  'keepass2android.keepass2android',
  'keepass2android.keepass2android_nonet',
  'com.beemdevelopment.aegis',
];

// Gestionnaires intégrés à un écosystème (Google, navigateur) : mieux que rien,
// mais on suggère une alternative indépendante.
export const ECOSYSTEM_MANAGER_PATTERN = /google[ -]?password|gestionnaire de mots de passe de google/i;

export const BEST_PRACTICES = [
  {
    id: 'unique',
    title: 'Un mot de passe différent par compte',
    text: 'Si un site se fait pirater, les voleurs essaient le même mot de passe ailleurs. Un mot de passe unique limite les dégâts à un seul compte.',
  },
  {
    id: 'long',
    title: 'Long plutôt que compliqué',
    text: 'Une phrase de passe de 4 mots au hasard ou plus (ou 16 caractères et plus) résiste mieux qu\'un mot court plein de symboles.',
  },
  {
    id: 'manager',
    title: 'Un gestionnaire plutôt que ta mémoire',
    text: 'Un gestionnaire génère et retient des mots de passe uniques à ta place. Tu n\'as plus à retenir qu\'un seul mot de passe maître, long et solide.',
  },
  {
    id: '2fa',
    title: 'Active la double authentification (2FA)',
    text: 'Un code temporaire en plus du mot de passe bloque la plupart des piratages. Préfère une application d\'authentification au SMS, et protège d\'abord ta messagerie.',
  },
  {
    id: 'passkeys',
    title: 'Adopte les passkeys quand c\'est possible',
    text: 'Une passkey remplace le mot de passe par une clé stockée sur ton appareil : impossible à hameçonner ou à réutiliser. Beaucoup de gestionnaires savent les gérer.',
  },
  {
    id: 'share',
    title: 'Ne communique jamais un mot de passe',
    text: 'Aucun service sérieux ne te le demande par e-mail, SMS ou téléphone. En cas de doute, passe par le site officiel.',
  },
];

// Cases du bilan de sécurité. `auto: true` = cochée automatiquement
// quand Trusti détecte un gestionnaire (voir computeHygiene).
export const HYGIENE_CHECKS = [
  {
    id: 'manager',
    label: 'J\'utilise un gestionnaire de mots de passe',
    auto: true,
  },
  {
    id: '2fa-mail',
    label: 'La double authentification est active sur ma messagerie',
  },
  {
    id: 'screen-lock',
    label: 'Mon écran est verrouillé (code, empreinte ou visage)',
  },
  {
    id: 'backup',
    label: 'Mes données importantes sont sauvegardées',
  },
  {
    id: 'updates',
    label: 'Mon téléphone et mes apps sont à jour',
  },
];
