/**
 * Contenu pédagogique "Hygiène numérique" : bonnes pratiques de gestion des
 * mots de passe, gestionnaires recommandés et cases du bilan de sécurité.
 * Chaque texte existe en version adulte et en version -15 ans (mode enfant).
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
    pitchKid: 'Gratuit, pratique, et ouvert à tous les regards.',
    url: 'https://play.google.com/store/apps/details?id=com.x8bit.bitwarden',
  },
  {
    key: 'keepassdx',
    name: 'KeePassDX',
    packageId: 'com.kunzisoft.keepass.free',
    pitch: '100 % local, sans compte : tes mots de passe restent dans un fichier que tu contrôles.',
    pitchKid: 'Tes mots de passe restent dans ton téléphone, rien ne part sur Internet.',
    url: 'https://play.google.com/store/apps/details?id=com.kunzisoft.keepass.free',
  },
  {
    key: 'proton-pass',
    name: 'Proton Pass',
    packageId: 'proton.android.pass',
    pitch: 'Chiffré de bout en bout, éditeur suisse, intégré à l\'écosystème Proton.',
    pitchKid: 'Un coffre-fort numérique fabriqué en Suisse.',
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
    titleKid: 'Un mot de passe différent partout',
    text: 'Si un site se fait pirater, les voleurs essaient le même mot de passe ailleurs. Un mot de passe unique limite les dégâts à un seul compte.',
    textKid: 'Ton mot de passe, c\'est comme ta brosse à dents : on ne la prête pas et on n\'a pas la même pour tout le monde !',
  },
  {
    id: 'long',
    title: 'Long plutôt que compliqué',
    titleKid: 'Long, c\'est mieux que bizarre',
    text: 'Une phrase de passe de 4 mots au hasard ou plus (ou 16 caractères et plus) résiste mieux qu\'un mot court plein de symboles.',
    textKid: 'Plusieurs mots au hasard, comme « chat-bleu-pizza-lune », c\'est solide et facile à retenir.',
  },
  {
    id: 'manager',
    title: 'Un gestionnaire plutôt que ta mémoire',
    titleKid: 'Un coffre-fort pour tes mots de passe',
    text: 'Un gestionnaire génère et retient des mots de passe uniques à ta place. Tu n\'as plus à retenir qu\'un seul mot de passe maître, long et solide.',
    textKid: 'Un coffre-fort numérique retient tout à ta place. Toi, tu retiens seulement la clé du coffre.',
  },
  {
    id: '2fa',
    title: 'Active la double authentification (2FA)',
    titleKid: 'Ajoute un deuxième verrou',
    text: 'Un code temporaire en plus du mot de passe bloque la plupart des piratages. Préfère une application d\'authentification au SMS, et protège d\'abord ta messagerie.',
    textKid: 'Comme une porte avec deux serrures : même si on devine le mot de passe, il reste le deuxième verrou.',
  },
  {
    id: 'passkeys',
    title: 'Adopte les passkeys quand c\'est possible',
    titleKid: 'Les clés magiques (passkeys)',
    text: 'Une passkey remplace le mot de passe par une clé stockée sur ton appareil : impossible à hameçonner ou à réutiliser. Beaucoup de gestionnaires savent les gérer.',
    textKid: 'Certains sites te laissent entrer avec ton téléphone, sans mot de passe à taper. C\'est le plus sûr !',
  },
  {
    id: 'share',
    title: 'Ne communique jamais un mot de passe',
    titleKid: 'Ne donne jamais tes mots de passe',
    text: 'Aucun service sérieux ne te le demande par e-mail, SMS ou téléphone. En cas de doute, passe par le site officiel.',
    textKid: 'Personne n\'a le droit de te le demander, même pas un « ami » en ligne. Seuls tes parents peuvent t\'aider.',
  },
];

// Cases du bilan de sécurité. `auto: true` = cochée automatiquement
// quand Trusti détecte un gestionnaire (voir computeHygiene).
export const HYGIENE_CHECKS = [
  {
    id: 'manager',
    label: 'J\'utilise un gestionnaire de mots de passe',
    labelKid: 'J\'ai un coffre-fort pour mes mots de passe',
    auto: true,
  },
  {
    id: '2fa-mail',
    label: 'La double authentification est active sur ma messagerie',
    labelKid: 'Mon e-mail a un deuxième verrou',
  },
  {
    id: 'screen-lock',
    label: 'Mon écran est verrouillé (code, empreinte ou visage)',
    labelKid: 'Mon écran est verrouillé quand je ne m\'en sers pas',
  },
  {
    id: 'backup',
    label: 'Mes données importantes sont sauvegardées',
    labelKid: 'Mes photos et fichiers importants sont sauvegardés',
  },
  {
    id: 'updates',
    label: 'Mon téléphone et mes apps sont à jour',
    labelKid: 'Mon téléphone et mes applis sont à jour',
  },
];
