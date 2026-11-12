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
    label: 'Suite territoriale (ANCT)',
    profiles: ['collectivite'],
    description: 'Nom de domaine conforme, messagerie et stockage sécurisés opérés par l\'État pour les communes de moins de 3 500 habitants et les intercommunalités de moins de 15 000 habitants, via votre opérateur public de services numériques.',
    url: 'https://suiteterritoriale.anct.gouv.fr',
  },
  {
    id: 'opsn',
    label: 'Opérateur public de services numériques et centre de gestion',
    profiles: ['collectivite'],
    description: 'Structures publiques mutualisées de votre département : logiciels métiers, parapheur, télétransmission des actes, DPO mutualisé. Le site de la Suite territoriale indique celui de votre commune.',
    url: 'https://suiteterritoriale.anct.gouv.fr',
  },
  {
    id: 'adullact',
    label: 'ADULLACT',
    profiles: ['collectivite'],
    description: 'Association des collectivités pour les logiciels libres : propose à ses adhérents des services en ligne, dont les formulaires de Démarches simplifiées (fermé aux nouvelles collectivités sur le site de l\'État depuis 2021).',
    url: 'https://adullact.org',
  },
  {
    id: 'comptoir-du-libre',
    label: 'Comptoir du Libre (ADULLACT)',
    profiles: ['collectivite'],
    description: 'Annuaire des logiciels libres utilisés par les collectivités, avec les collectivités utilisatrices et les prestataires.',
    url: 'https://comptoir-du-libre.org',
  },
  {
    id: 'sill',
    label: 'Socle interministériel de logiciels libres (SILL)',
    profiles: ['collectivite', 'enseignement', 'sante'],
    description: 'Liste des logiciels libres recommandés par l\'État, avec des agents publics référents.',
    url: 'https://code.gouv.fr/sill',
  },
  {
    id: 'monaidecyber',
    label: 'MonAideCyber (ANSSI)',
    description: 'Diagnostic cyber gratuit réalisé par un aidant bénévole, pour les structures publiques et privées de petite taille.',
    url: 'https://monaide.cyber.gouv.fr',
  },
  {
    id: 'monservicesecurise',
    label: 'MonServiceSécurisé (ANSSI)',
    profiles: ['collectivite', 'sante', 'enseignement'],
    description: 'Outil gratuit pour sécuriser et homologuer les services numériques d\'une administration (site, téléservices).',
    url: 'https://monservicesecurise.cyber.gouv.fr',
  },
  {
    id: 'cybermalveillance',
    label: 'Cybermalveillance.gouv.fr',
    description: 'Guides de prévention, prestataires labellisés près de chez vous et assistance en cas d\'incident.',
    url: 'https://www.cybermalveillance.gouv.fr',
  },
  {
    id: '17cyber',
    label: '17Cyber',
    description: 'Le réflexe en cas de cyberattaque : diagnostic en ligne de la situation et orientation vers l\'aide adaptée.',
    url: 'https://www.17cyber.gouv.fr',
  },
  {
    id: 'cnil-collectivites',
    label: 'CNIL : collectivités territoriales',
    profiles: ['collectivite'],
    description: 'Guides RGPD dédiés aux collectivités : DPO, registre, état civil, vidéoprotection, listes électorales.',
    url: 'https://www.cnil.fr/fr/collectivites-territoriales',
  },
];

/** Ressources d'aide pour un profil, celles du profil d'abord. */
export function helpForProfile(profileId) {
  const specific = ORG_HELP.filter(h => h.profiles && profileId && h.profiles.includes(profileId));
  const common = ORG_HELP.filter(h => !h.profiles);
  return [...specific, ...common];
}
