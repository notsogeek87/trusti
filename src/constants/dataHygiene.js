import { t } from '../i18n/index.js';
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
    get pitch() { return t('hygiene.managers.bitwarden.pitch'); },
    url: 'https://play.google.com/store/apps/details?id=com.x8bit.bitwarden',
  },
  {
    key: 'keepassdx',
    name: 'KeePassDX',
    packageId: 'com.kunzisoft.keepass.free',
    get pitch() { return t('hygiene.managers.keepassdx.pitch'); },
    url: 'https://play.google.com/store/apps/details?id=com.kunzisoft.keepass.free',
  },
  {
    key: 'proton-pass',
    name: 'Proton Pass',
    packageId: 'proton.android.pass',
    get pitch() { return t('hygiene.managers.proton-pass.pitch'); },
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
    get title() { return t('hygiene.practices.unique.title'); },
    get text() { return t('hygiene.practices.unique.text'); },
  },
  {
    id: 'long',
    get title() { return t('hygiene.practices.long.title'); },
    get text() { return t('hygiene.practices.long.text'); },
  },
  {
    id: 'manager',
    get title() { return t('hygiene.practices.manager.title'); },
    get text() { return t('hygiene.practices.manager.text'); },
  },
  {
    id: '2fa',
    get title() { return t('hygiene.practices.2fa.title'); },
    get text() { return t('hygiene.practices.2fa.text'); },
  },
  {
    id: 'passkeys',
    get title() { return t('hygiene.practices.passkeys.title'); },
    get text() { return t('hygiene.practices.passkeys.text'); },
  },
  {
    id: 'share',
    get title() { return t('hygiene.practices.share.title'); },
    get text() { return t('hygiene.practices.share.text'); },
  },
];

// Cases du bilan de sécurité. `auto: true` = cochée automatiquement
// quand Trusti détecte un gestionnaire (voir computeHygiene).
export const HYGIENE_CHECKS = [
  {
    id: 'manager',
    get label() { return t('hygiene.checks.manager.label'); },
    auto: true,
  },
  {
    id: '2fa-mail',
    get label() { return t('hygiene.checks.2fa-mail.label'); },
  },
  {
    id: 'screen-lock',
    get label() { return t('hygiene.checks.screen-lock.label'); },
  },
  {
    id: 'backup',
    get label() { return t('hygiene.checks.backup.label'); },
  },
  {
    id: 'updates',
    get label() { return t('hygiene.checks.updates.label'); },
  },
];
