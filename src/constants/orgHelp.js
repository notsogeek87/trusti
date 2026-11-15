import { t } from '../i18n/index.js';
/**
 * « Qui peut vous aider » : dispositifs publics ou associatifs, gratuits ou
 * mutualisés, affichés dans la synthèse et le rapport PDF de l'évaluation.
 * - profiles : profils concernés (ids de ORG_PROFILES) ; absent = tous
 * Liens vérifiés en novembre 2026.
 */
export const ORG_HELP_REVIEWED_AT = '2026-11';

export const ORG_HELP = [
  {
    id: 'suite-territoriale',
    label: t('org.help.suite-territoriale.label'),
    profiles: ['collectivite'],
    description: t('org.help.suite-territoriale.description'),
    url: 'https://suiteterritoriale.anct.gouv.fr',
  },
  {
    id: 'opsn',
    label: t('org.help.opsn.label'),
    profiles: ['collectivite'],
    description: t('org.help.opsn.description'),
    url: 'https://suiteterritoriale.anct.gouv.fr',
  },
  {
    id: 'adullact',
    label: t('org.help.adullact.label'),
    profiles: ['collectivite'],
    description: t('org.help.adullact.description'),
    url: 'https://adullact.org',
  },
  {
    id: 'comptoir-du-libre', // i18n-ignore
    label: t('org.help.comptoir-du-libre.label'),
    profiles: ['collectivite'],
    description: t('org.help.comptoir-du-libre.description'),
    url: 'https://comptoir-du-libre.org', // i18n-ignore
  },
  {
    id: 'sill',
    label: t('org.help.sill.label'),
    profiles: ['collectivite', 'enseignement', 'sante'],
    description: t('org.help.sill.description'),
    url: 'https://code.gouv.fr/sill',
  },
  {
    id: 'monaidecyber',
    label: t('org.help.monaidecyber.label'),
    description: t('org.help.monaidecyber.description'),
    url: 'https://monaide.cyber.gouv.fr',
  },
  {
    id: 'monservicesecurise',
    label: t('org.help.monservicesecurise.label'),
    profiles: ['collectivite', 'sante', 'enseignement'],
    description: t('org.help.monservicesecurise.description'),
    url: 'https://monservicesecurise.cyber.gouv.fr',
  },
  {
    id: 'cybermalveillance',
    label: t('org.help.cybermalveillance.label'),
    description: t('org.help.cybermalveillance.description'),
    url: 'https://www.cybermalveillance.gouv.fr',
  },
  {
    id: '17cyber',
    label: t('org.help.17cyber.label'),
    description: t('org.help.17cyber.description'),
    url: 'https://www.17cyber.gouv.fr',
  },
  {
    id: 'cnil-collectivites',
    label: t('org.help.cnil-collectivites.label'),
    profiles: ['collectivite'],
    description: t('org.help.cnil-collectivites.description'),
    url: 'https://www.cnil.fr/fr/collectivites-territoriales',
  },
];

/** Ressources d'aide pour un profil, celles du profil d'abord. */
export function helpForProfile(profileId) {
  const specific = ORG_HELP.filter(h => h.profiles && profileId && h.profiles.includes(profileId));
  const common = ORG_HELP.filter(h => !h.profiles);
  return [...specific, ...common];
}
