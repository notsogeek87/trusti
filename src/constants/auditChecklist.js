import { t } from '../i18n/index.js';
/**
 * Questionnaire d'audit de terrain de la page « Évaluer mon organisation ».
 *
 * Complète la note des outils par les pratiques : comptes, sauvegardes,
 * réversibilité, données sensibles. Chaque question a une « mauvaise réponse »
 * (riskAnswer) qui déclenche une recommandation ; « Je ne sais pas » est
 * classé « à vérifier ».
 * - profiles : profils concernés (ids de ORG_PROFILES) ; absent = tous
 * - weight   : 'haute' (risque fort) ou 'moyenne'
 *
 * Fonctions de calcul dans src/utils/auditChecklist.js.
 */

export const AUDIT_ANSWERS = [
  { id: 'oui', label: t('org.audit.k001') },
  { id: 'non', label: t('org.audit.k002') },
  { id: 'nsp', label: t('org.audit.k003') },
];

export const AUDIT_WEIGHTS = {
  haute: { label: t('org.audit.k004'), rank: 0 },
  moyenne: { label: t('org.audit.k005'), rank: 1 },
};

// Thèmes : clés de regroupement (traduits à l'affichage par auditThemeLabel)
// i18n-ignore-start
export const AUDIT_THEMES = [
  'Comptes et accès',
  'Postes et sauvegardes',
  'Messagerie et échanges',
  'Données personnelles',
  'Contrats et réversibilité',
  'Organisation',
];
// i18n-ignore-end

export const AUDIT_QUESTIONS = [
  // Comptes et accès
  {
    id: 'mfa',
    theme: 'Comptes et accès', // i18n-ignore
    label: t('org.audit.k006'),
    riskAnswer: 'non',
    weight: 'haute',
    recommendation: t('org.audit.k007'),
  },
  {
    id: 'comptes-partages',
    theme: 'Comptes et accès', // i18n-ignore
    label: t('org.audit.k008'),
    riskAnswer: 'oui',
    weight: 'haute',
    recommendation: t('org.audit.k009'),
  },
  {
    id: 'gestionnaire-mdp',
    theme: 'Comptes et accès', // i18n-ignore
    label: t('org.audit.k010'),
    riskAnswer: 'non',
    weight: 'moyenne',
    recommendation: t('org.audit.k011'),
  },
  {
    id: 'departs',
    theme: 'Comptes et accès', // i18n-ignore
    label: t('org.audit.k012'),
    riskAnswer: 'non',
    weight: 'haute',
    recommendation: t('org.audit.k013'),
  },
  // Postes et sauvegardes
  {
    id: 'mises-a-jour',
    theme: 'Postes et sauvegardes', // i18n-ignore
    label: t('org.audit.k014'),
    help: t('org.audit.k015'),
    riskAnswer: 'non',
    weight: 'haute',
    recommendation: t('org.audit.k016'),
  },
  {
    id: 'appareils-perso',
    theme: 'Postes et sauvegardes', // i18n-ignore
    label: t('org.audit.k017'),
    riskAnswer: 'oui',
    weight: 'moyenne',
    recommendation: t('org.audit.k018'),
  },
  {
    id: 'sauvegarde',
    theme: 'Postes et sauvegardes', // i18n-ignore
    label: t('org.audit.k019'),
    riskAnswer: 'non',
    weight: 'haute',
    recommendation: t('org.audit.k020'),
  },
  {
    id: 'restauration',
    theme: 'Postes et sauvegardes', // i18n-ignore
    label: t('org.audit.k021'),
    riskAnswer: 'non',
    weight: 'moyenne',
    recommendation: t('org.audit.k022'),
  },
  // Messagerie et échanges
  {
    id: 'nom-de-domaine',
    theme: 'Messagerie et échanges', // i18n-ignore
    label: t('org.audit.k023'),
    help: t('org.audit.k024'),
    riskAnswer: 'non',
    weight: 'moyenne',
    recommendation: t('org.audit.k025'),
  },
  {
    id: 'messagerie-gratuite',
    theme: 'Messagerie et échanges', // i18n-ignore
    label: t('org.audit.k026'),
    riskAnswer: 'oui',
    weight: 'moyenne',
    recommendation: t('org.audit.k027'),
  },
  {
    id: 'elus-adresse-perso',
    theme: 'Messagerie et échanges', // i18n-ignore
    profiles: ['collectivite'],
    label: t('org.audit.k028'),
    riskAnswer: 'oui',
    weight: 'moyenne',
    recommendation: t('org.audit.k029'),
  },
  {
    id: 'messagerie-instantanee',
    theme: 'Messagerie et échanges', // i18n-ignore
    label: t('org.audit.k030'),
    riskAnswer: 'oui',
    weight: 'moyenne',
    recommendation: t('org.audit.k031'),
  },
  {
    id: 'site-traceurs',
    theme: 'Messagerie et échanges', // i18n-ignore
    label: t('org.audit.k032'),
    riskAnswer: 'oui',
    weight: 'moyenne',
    recommendation: t('org.audit.k033'),
  },
  // Données personnelles
  {
    id: 'dpo',
    theme: 'Données personnelles', // i18n-ignore
    profiles: ['collectivite'],
    label: t('org.audit.k034'),
    help: t('org.audit.k035'),
    riskAnswer: 'non',
    weight: 'haute',
    recommendation: t('org.audit.k036'),
  },
  {
    id: 'registre',
    theme: 'Données personnelles', // i18n-ignore
    label: t('org.audit.k037'),
    riskAnswer: 'non',
    weight: 'moyenne',
    recommendation: t('org.audit.k038'),
  },
  {
    id: 'donnees-sensibles',
    theme: 'Données personnelles', // i18n-ignore
    profiles: ['collectivite', 'sante', 'enseignement', 'association'],
    label: t('org.audit.k039'),
    riskAnswer: 'non',
    weight: 'haute',
    recommendation: t('org.audit.k040'),
  },
  // Contrats et réversibilité
  {
    id: 'export-donnees',
    theme: 'Contrats et réversibilité', // i18n-ignore
    label: t('org.audit.k041'),
    riskAnswer: 'non',
    weight: 'haute',
    recommendation: t('org.audit.k042'),
  },
  {
    id: 'contrats-hebergement',
    theme: 'Contrats et réversibilité', // i18n-ignore
    label: t('org.audit.k043'),
    riskAnswer: 'non',
    weight: 'moyenne',
    recommendation: t('org.audit.k044'),
  },
  // Organisation
  {
    id: 'referent',
    theme: 'Organisation', // i18n-ignore
    label: t('org.audit.k045'),
    riskAnswer: 'non',
    weight: 'moyenne',
    recommendation: t('org.audit.k046'),
  },
  {
    id: 'incident',
    theme: 'Organisation', // i18n-ignore
    label: t('org.audit.k047'),
    riskAnswer: 'non',
    weight: 'moyenne',
    recommendation: t('org.audit.k048'),
  },
];

/** Libellé affiché d'un thème du questionnaire. */
export const auditThemeLabel = (theme) => t('org.audit.themes')?.[theme] || theme;
