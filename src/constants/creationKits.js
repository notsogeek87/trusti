import { t } from '../i18n/index.js';
/**
 * Kits de démarrage de l'assistant « Créer mon organisation » (page ?creer-organisation).
 *
 * V1 : public prioritaire = associations et petites structures (jusqu'à 50 personnes).
 * Kits choisis à la main, pas générés : un besoin = un outil recommandé par approche.
 * Les ids sont ceux de la table applications (apps « usage pro ») ; un id absent du
 * catalogue est simplement ignoré à l'affichage.
 *
 * Exclus volontairement : les outils de « La Suite numérique » (Docs, Fichiers, Visio,
 * Tchap), réservés aux agents de l'État. Pour les collectivités, l'accès dépend de
 * la Suite territoriale de l'ANCT (petites communes, via leur opérateur public de
 * services numériques) : on le signale dans le texte, sans en faire un choix du kit.
 *
 * Un choix peut porter à la fois appId et note : la note s'affiche tant que l'outil
 * n'est pas au catalogue. typePicks remplace picks pour un type de structure.
 *
 * Coût : indication grossière, à vérifier chez l'éditeur (affiché comme tel).
 * - 'libre'    : logiciel libre, sans licence à payer
 * - 'gratuit'  : service gratuit, sans offre payante nécessaire
 * - 'freemium' : offre gratuite limitée, options payantes
 * - 'payant'   : abonnement
 */

/** Dernière relecture des kits (les offres des éditeurs évoluent). */
export const KITS_REVIEWED_AT = '2026-11';

export const CREATION_TYPES = [
  { id: 'association', label: t('org.kits.k001'), hint: t('org.kits.k002'), evaluationProfile: 'association' },
  { id: 'tpe', label: t('org.kits.k003'), hint: t('org.kits.k004'), evaluationProfile: 'entreprise' },
  { id: 'collectivite', label: t('org.kits.k005'), hint: t('org.kits.k006'), evaluationProfile: 'collectivite' },
];

export const CREATION_SIZES = [
  { id: 'solo', label: t('org.kits.k007'), hint: t('org.kits.k008'), level: 1 },
  { id: 'petite', label: t('org.kits.k009'), hint: t('org.kits.k010'), level: 2 },
  { id: 'moyenne', label: t('org.kits.k011'), hint: t('org.kits.k012'), level: 3 },
];

export const CREATION_APPROACHES = [
  {
    id: 'simple',
    label: t('org.kits.k013'),
    hint: t('org.kits.k014'),
  },
  {
    id: 'confidentiel',
    label: t('org.kits.k015'),
    hint: t('org.kits.k016'),
  },
  {
    id: 'libre',
    label: t('org.kits.k017'),
    hint: t('org.kits.k018'),
  },
];

const MAIRIE_EMAIL_WHY = t('org.kits.k019');
const OLVID_ELUS_WHY = t('org.kits.k020');
const METIERS_NOTE = t('org.kits.k021');
const ACTES_NOTE = t('org.kits.k022');
const DEMARCHES_WHY = t('org.kits.k023');
const HABITANTS_WHY = t('org.kits.k024');
const HABITANTS_NOTE = t('org.kits.k025');
const SITE_NOTE = t('org.kits.k026');

export const COST_LABELS = {
  libre: t('org.kits.k027'),
  gratuit: t('org.kits.costFree'),
  freemium: t('org.kits.k028'),
  payant: t('org.kits.costPaid'),
};

/**
 * Besoins couverts, dans l'ordre de mise en place.
 * - minSize : taille minimale (niveau de CREATION_SIZES) à partir de laquelle le besoin apparaît
 * - types   : types de structure concernés (absent = tous)
 * - picks   : par approche, { appId, why, cost } ; ou { note } quand un autre outil du kit couvre déjà le besoin
 */
export const KIT_NEEDS = [
  {
    id: 'email',
    label: t('org.kits.k029'),
    step: 'Démarrer', // i18n-ignore
    minSize: 1,
    picks: {
      simple: { appId: '1769804133553', cost: 'freemium', why: t('org.kits.k030') },
      confidentiel: { appId: 'tutanota', cost: 'payant', why: t('org.kits.k031') },
      libre: { appId: 'mailo', cost: 'payant', why: t('org.kits.k032') },
    },
    typePicks: {
      collectivite: {
        simple: { appId: 'mailo', cost: 'payant', why: MAIRIE_EMAIL_WHY },
        confidentiel: { appId: 'mailo', cost: 'payant', why: MAIRIE_EMAIL_WHY },
        libre: { appId: 'mailo', cost: 'payant', why: MAIRIE_EMAIL_WHY },
      },
    },
  },
  {
    id: 'stockage',
    label: t('org.kits.k033'),
    step: 'Démarrer', // i18n-ignore
    minSize: 1,
    picks: {
      simple: { appId: '1769805814704', cost: 'freemium', why: t('org.kits.k034') },
      confidentiel: { appId: '7214caf9-78e9-4769-9fc7-f1ef5f3f2efb', cost: 'freemium', why: t('org.kits.k035') },
      libre: { appId: 'nextcloud', cost: 'libre', why: t('org.kits.k036') },
    },
  },
  {
    id: 'bureautique',
    label: t('org.kits.k037'),
    step: 'Démarrer', // i18n-ignore
    minSize: 1,
    picks: {
      simple: { appId: 'libreoffice', cost: 'libre', why: t('org.kits.k038') },
      confidentiel: { appId: 'cryptpad', cost: 'freemium', why: t('org.kits.k039') },
      libre: { appId: 'libreoffice', cost: 'libre', why: t('org.kits.k040') },
    },
  },
  {
    id: 'motsdepasse',
    label: t('org.kits.k041'),
    step: 'Sécuriser', // i18n-ignore
    minSize: 1,
    picks: {
      simple: { appId: '1769804898711', cost: 'freemium', why: t('org.kits.k042') },
      confidentiel: { appId: 'keepassxc', cost: 'libre', why: t('org.kits.k043') },
      libre: { appId: 'passbolt', cost: 'libre', why: t('org.kits.k044') },
    },
  },
  {
    id: 'messagerie',
    label: t('org.kits.k045'),
    step: 'Travailler ensemble', // i18n-ignore
    minSize: 2,
    picks: {
      simple: { appId: '0678b7ca-7f61-43f9-ba27-c93d800166d5', cost: 'freemium', why: t('org.kits.k047') },
      confidentiel: { appId: '0678b7ca-7f61-43f9-ba27-c93d800166d5', cost: 'freemium', why: t('org.kits.k048') },
      libre: { appId: 'element', cost: 'libre', why: t('org.kits.k049') },
    },
    typePicks: {
      collectivite: {
        simple: { appId: '0678b7ca-7f61-43f9-ba27-c93d800166d5', cost: 'freemium', why: OLVID_ELUS_WHY },
        confidentiel: { appId: '0678b7ca-7f61-43f9-ba27-c93d800166d5', cost: 'freemium', why: OLVID_ELUS_WHY },
        libre: { appId: 'element', cost: 'libre', why: t('org.kits.k050') },
      },
    },
  },
  {
    id: 'visio',
    label: t('org.kits.k051'),
    step: 'Travailler ensemble', // i18n-ignore
    minSize: 2,
    picks: {
      simple: { appId: 'ca417378-a0f2-42e4-8dac-19683938cd68', cost: 'gratuit', why: t('org.kits.k053') },
      confidentiel: { appId: 'ca417378-a0f2-42e4-8dac-19683938cd68', cost: 'gratuit', why: t('org.kits.k054') },
      libre: { appId: 'bigbluebutton', cost: 'libre', why: t('org.kits.k055') },
    },
  },
  {
    id: 'agenda',
    label: t('org.kits.k056'),
    step: 'Travailler ensemble', // i18n-ignore
    minSize: 2,
    picks: {
      simple: { appId: 'doodle', cost: 'freemium', why: t('org.kits.k058') },
      confidentiel: { appId: 'doodle', cost: 'freemium', why: t('org.kits.k059') },
      libre: { note: t('org.kits.k060') },
    },
  },
  {
    id: 'adherents',
    label: t('org.kits.k061'),
    step: 'Gérer', // i18n-ignore
    minSize: 1,
    types: ['association'],
    picks: {
      simple: { appId: 'dolibarr', cost: 'libre', why: t('org.kits.k062') },
      confidentiel: { appId: 'dolibarr', cost: 'libre', why: t('org.kits.k063') },
      libre: { appId: 'dolibarr', cost: 'libre', why: t('org.kits.k064') },
    },
  },
  {
    id: 'newsletter',
    label: t('org.kits.k065'),
    step: 'Communiquer', // i18n-ignore
    minSize: 1,
    types: ['association'],
    picks: {
      simple: { appId: 'brevo', cost: 'freemium', why: t('org.kits.k066') },
      confidentiel: { appId: 'brevo', cost: 'freemium', why: t('org.kits.k067') },
      libre: { appId: 'brevo', cost: 'freemium', why: t('org.kits.k068') },
    },
  },
  {
    id: 'compta',
    label: t('org.kits.k069'),
    step: 'Gérer', // i18n-ignore
    minSize: 1,
    types: ['tpe'],
    picks: {
      simple: { appId: 'pennylane', cost: 'payant', why: t('org.kits.k070') },
      confidentiel: { appId: 'dolibarr', cost: 'libre', why: t('org.kits.k071') },
      libre: { appId: 'dolibarr', cost: 'libre', why: t('org.kits.k072') },
    },
  },
  {
    id: 'signature',
    label: t('org.kits.k073'),
    step: 'Gérer', // i18n-ignore
    minSize: 1,
    types: ['tpe'],
    picks: {
      simple: { appId: 'yousign', cost: 'freemium', why: t('org.kits.k074') },
      confidentiel: { appId: 'yousign', cost: 'freemium', why: t('org.kits.k075') },
      libre: { appId: 'yousign', cost: 'freemium', why: t('org.kits.k076') },
    },
  },
  {
    id: 'crm',
    label: t('org.kits.k077'),
    step: 'Gérer', // i18n-ignore
    minSize: 2,
    types: ['tpe'],
    picks: {
      simple: { appId: 'twenty', cost: 'payant', why: t('org.kits.k078') },
      confidentiel: { appId: 'twenty', cost: 'payant', why: t('org.kits.k079') },
      libre: { appId: 'dolibarr', cost: 'libre', why: t('org.kits.k080') },
    },
  },
  {
    id: 'metiers',
    label: t('org.kits.k081'),
    step: 'Gérer', // i18n-ignore
    minSize: 1,
    types: ['collectivite'],
    picks: {
      simple: { note: METIERS_NOTE },
      confidentiel: { note: METIERS_NOTE },
      libre: { appId: 'openmairie', cost: 'libre', why: t('org.kits.k082'), note: METIERS_NOTE },
    },
  },
  {
    id: 'actes',
    label: t('org.kits.k083'),
    step: 'Gérer', // i18n-ignore
    minSize: 1,
    types: ['collectivite'],
    picks: {
      simple: { appId: 'i-parapheur', cost: 'libre', why: t('org.kits.k084'), note: ACTES_NOTE },
      confidentiel: { appId: 'i-parapheur', cost: 'libre', why: t('org.kits.k085'), note: ACTES_NOTE },
      libre: { appId: 'i-parapheur', cost: 'libre', why: t('org.kits.k086'), note: ACTES_NOTE },
    },
  },
  {
    id: 'demarches',
    label: t('org.kits.k087'),
    step: 'Communiquer', // i18n-ignore
    minSize: 1,
    types: ['collectivite'],
    picks: {
      simple: { appId: 'demarches-simplifiees', cost: 'payant', why: DEMARCHES_WHY, note: DEMARCHES_WHY },
      confidentiel: { appId: 'demarches-simplifiees', cost: 'payant', why: DEMARCHES_WHY, note: DEMARCHES_WHY },
      libre: { appId: 'demarches-simplifiees', cost: 'payant', why: DEMARCHES_WHY, note: DEMARCHES_WHY },
    },
  },
  {
    id: 'habitants',
    label: t('org.kits.k088'),
    step: 'Communiquer', // i18n-ignore
    minSize: 1,
    types: ['collectivite'],
    picks: {
      simple: { appId: 'panneaupocket', cost: 'payant', why: HABITANTS_WHY, note: HABITANTS_NOTE },
      confidentiel: { appId: 'panneaupocket', cost: 'payant', why: HABITANTS_WHY, note: HABITANTS_NOTE },
      libre: { appId: 'panneaupocket', cost: 'payant', why: HABITANTS_WHY, note: HABITANTS_NOTE },
    },
  },
  {
    id: 'site',
    label: t('org.kits.k089'),
    step: 'Communiquer', // i18n-ignore
    minSize: 1,
    types: ['collectivite'],
    picks: {
      simple: { note: SITE_NOTE },
      confidentiel: { note: SITE_NOTE },
      libre: { appId: 'matomo', cost: 'libre', why: t('org.kits.k090'), note: SITE_NOTE },
    },
  },
  {
    id: 'notes',
    label: t('org.kits.k091'),
    step: 'Organiser', // i18n-ignore
    minSize: 1,
    picks: {
      simple: { appId: '4cc90381-be9a-483b-8d5c-59b471737e6f', cost: 'libre', why: t('org.kits.k092') },
      confidentiel: { appId: '4cc90381-be9a-483b-8d5c-59b471737e6f', cost: 'libre', why: t('org.kits.k093') },
      libre: { appId: '4cc90381-be9a-483b-8d5c-59b471737e6f', cost: 'libre', why: t('org.kits.k094') },
    },
  },
  {
    id: 'taches',
    label: t('org.kits.k095'),
    step: 'Organiser', // i18n-ignore
    minSize: 3,
    picks: {
      simple: { appId: 'e688f70b-cb20-4ff2-84bd-7e75ef2a0f66', cost: 'payant', why: t('org.kits.k096') },
      confidentiel: { appId: 'e688f70b-cb20-4ff2-84bd-7e75ef2a0f66', cost: 'libre', why: t('org.kits.k097') },
      libre: { appId: 'openproject', cost: 'libre', why: t('org.kits.k098') },
    },
  },
  {
    id: 'wiki',
    label: t('org.kits.k099'),
    step: 'Organiser', // i18n-ignore
    minSize: 3,
    picks: {
      simple: { appId: 'xwiki', cost: 'payant', why: t('org.kits.k100') },
      confidentiel: { appId: 'cryptpad', cost: 'freemium', why: t('org.kits.k101') },
      libre: { appId: 'bookstack', cost: 'libre', why: t('org.kits.k102') },
    },
  },
  {
    id: 'ia',
    label: t('org.kits.k103'),
    step: 'Organiser', // i18n-ignore
    minSize: 1,
    picks: {
      simple: { appId: '1770752284146', cost: 'freemium', why: t('org.kits.k104') },
      confidentiel: { appId: '1769540682080', cost: 'freemium', why: t('org.kits.k105') },
      libre: { appId: '1770752500004', cost: 'libre', why: t('org.kits.k106') },
    },
  },
  {
    id: 'sauvegarde',
    label: t('org.kits.k107'),
    step: 'Sécuriser', // i18n-ignore
    minSize: 1,
    approaches: ['libre'],
    picks: {
      libre: { appId: 'borgbackup', cost: 'libre', why: t('org.kits.k108') },
    },
  },
];

/** Ordre d'affichage des étapes de mise en place. */
// Étapes : clés de regroupement (traduites à l'affichage par kitStepLabel)
// i18n-ignore-start
export const KIT_STEPS = ['Démarrer', 'Sécuriser', 'Travailler ensemble', 'Gérer', 'Communiquer', 'Organiser'];
// i18n-ignore-end

/** Libellé affiché d'une étape du kit. */
export const kitStepLabel = (step) => t('org.kits.steps')?.[step] || step;
