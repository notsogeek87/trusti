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
  { id: 'association', label: 'Association', hint: 'Loi 1901, collectif, club, fédération locale…', evaluationProfile: 'association' },
  { id: 'tpe', label: 'Petite entreprise ou indépendant', hint: 'Micro-entreprise, TPE, startup, profession libérale…', evaluationProfile: 'entreprise' },
  { id: 'collectivite', label: 'Mairie ou collectivité', hint: 'Commune, intercommunalité, syndicat, CCAS…', evaluationProfile: 'collectivite' },
];

export const CREATION_SIZES = [
  { id: 'solo', label: 'Seul·e pour l\'instant', hint: '1 personne', level: 1 },
  { id: 'petite', label: 'Petite équipe', hint: '2 à 10 personnes', level: 2 },
  { id: 'moyenne', label: 'Équipe plus large', hint: '11 à 50 personnes', level: 3 },
];

export const CREATION_APPROACHES = [
  {
    id: 'simple',
    label: 'Simple et européen',
    hint: 'Des services en ligne prêts à l\'emploi, rien à installer.',
  },
  {
    id: 'confidentiel',
    label: 'Confidentialité maximale',
    hint: 'Des outils chiffrés de bout en bout, pour des échanges ou des données sensibles.',
  },
  {
    id: 'libre',
    label: 'Libre et autonome',
    hint: 'Des logiciels libres sur votre propre serveur. Il faut quelqu\'un pour les installer et les maintenir.',
  },
];

const MAIRIE_EMAIL_WHY = 'Messagerie d\'un fournisseur français, données hébergées en France, à l\'adresse de la commune. '
  + 'Commune de moins de 3 500 habitants : demandez d\'abord à votre opérateur public de services numériques la messagerie de la Suite territoriale (ANCT).';
const OLVID_ELUS_WHY = 'Messagerie chiffrée française, sans numéro de téléphone, certifiée par l\'ANSSI : à proposer aux élus et aux agents à la place des groupes WhatsApp.';
const METIERS_NOTE = 'Gardez votre éditeur actuel s\'il vous convient, mais avant tout renouvellement exigez par contrat l\'export complet de vos données dans un format ouvert. '
  + 'Alternatives : les logiciels libres OpenMairie (élections, cimetière, urbanisme…) ou l\'offre mutualisée de votre opérateur public de services numériques.';
const ACTES_NOTE = 'Les logiciels libres de Libriciel (i-Parapheur, S²LOW, webdelib) sont souvent fournis par votre opérateur public de services numériques ou votre centre de gestion.';
const DEMARCHES_WHY = 'Logiciel libre de l\'État pour mettre en ligne les formulaires de la commune (inscriptions, demandes, dossiers). '
  + 'Fermé aux nouvelles collectivités depuis 2021 sur le site de l\'État : il leur est proposé par l\'ADULLACT, réservé à ses adhérents.';
const HABITANTS_WHY = 'Application d\'information et d\'alerte des habitants, éditeur français : abonnement pour la commune, gratuite pour les habitants, sans compte à créer.';
const HABITANTS_NOTE = 'Une application d\'information des habitants (PanneauPocket, IntraMuros, Illiwap…) plutôt qu\'une page Facebook, qui impose Facebook à ceux qui veulent suivre la commune.';
const SITE_NOTE = 'Site chez un hébergeur français ou européen, mesure d\'audience sans cookies publicitaires (Matomo). Des offres mutualisées existent souvent via votre département ou votre opérateur public de services numériques.';

export const COST_LABELS = {
  libre: 'Libre, sans licence',
  gratuit: 'Gratuit',
  freemium: 'Offre gratuite limitée',
  payant: 'Abonnement',
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
    label: 'E-mail à votre nom',
    step: 'Démarrer',
    minSize: 1,
    picks: {
      simple: { appId: '1769804133553', cost: 'freemium', why: 'Messagerie d\'un hébergeur suisse, données en Suisse. Une adresse à votre nom de domaine est incluse gratuitement (seul le domaine est payant) ; au-delà, abonnement.' },
      confidentiel: { appId: 'tutanota', cost: 'payant', why: 'Messagerie chiffrée de bout en bout, hébergée en Allemagne. L\'adresse à votre nom de domaine demande une offre payante.' },
      libre: { appId: 'mailo', cost: 'payant', why: 'L\'e-mail est délicat à héberger soi-même : confiez-le à un fournisseur français, données hébergées en France.' },
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
    label: 'Fichiers partagés',
    step: 'Démarrer',
    minSize: 1,
    picks: {
      simple: { appId: '1769805814704', cost: 'freemium', why: 'Stockage et partage de fichiers hébergés en Suisse, chez le même fournisseur que l\'e-mail. 15 Go gratuits.' },
      confidentiel: { appId: '7214caf9-78e9-4769-9fc7-f1ef5f3f2efb', cost: 'freemium', why: 'Stockage chiffré de bout en bout, éditeur suisse. 5 Go gratuits.' },
      libre: { appId: 'nextcloud', cost: 'libre', why: 'Fichiers, agenda et contacts sur votre serveur.' },
    },
  },
  {
    id: 'bureautique',
    label: 'Documents et tableurs',
    step: 'Démarrer',
    minSize: 1,
    picks: {
      simple: { appId: 'libreoffice', cost: 'libre', why: 'Suite bureautique libre, sans abonnement, qui ouvre les fichiers Word et Excel.' },
      confidentiel: { appId: 'cryptpad', cost: 'freemium', why: 'Documents collaboratifs chiffrés dans le navigateur, éditeur français.' },
      libre: { appId: 'libreoffice', cost: 'libre', why: 'Suite bureautique libre, sans abonnement, qui ouvre les fichiers Word et Excel.' },
    },
  },
  {
    id: 'motsdepasse',
    label: 'Mots de passe',
    step: 'Sécuriser',
    minSize: 1,
    picks: {
      simple: { appId: '1769804898711', cost: 'freemium', why: 'Gestionnaire open source. Partage des accès de la structure gratuit à 2 personnes, payant au-delà.' },
      confidentiel: { appId: 'keepassxc', cost: 'libre', why: 'Coffre-fort libre, stocké chez vous, sans service en ligne.' },
      libre: { appId: 'passbolt', cost: 'libre', why: 'Gestionnaire de mots de passe d\'équipe libre et auto-hébergeable, éditeur luxembourgeois.' },
    },
  },
  {
    id: 'messagerie',
    label: 'Discussion d\'équipe',
    step: 'Travailler ensemble',
    minSize: 2,
    picks: {
      simple: { appId: '0678b7ca-7f61-43f9-ba27-c93d800166d5', cost: 'freemium', why: 'Messagerie chiffrée française, sans numéro de téléphone.' },
      confidentiel: { appId: '0678b7ca-7f61-43f9-ba27-c93d800166d5', cost: 'freemium', why: 'Messagerie chiffrée française, sans numéro de téléphone.' },
      libre: { appId: 'element', cost: 'libre', why: 'Messagerie d\'équipe sur le protocole ouvert Matrix, auto-hébergeable.' },
    },
    typePicks: {
      collectivite: {
        simple: { appId: '0678b7ca-7f61-43f9-ba27-c93d800166d5', cost: 'freemium', why: OLVID_ELUS_WHY },
        confidentiel: { appId: '0678b7ca-7f61-43f9-ba27-c93d800166d5', cost: 'freemium', why: OLVID_ELUS_WHY },
        libre: { appId: 'element', cost: 'libre', why: 'Messagerie d\'équipe sur le protocole ouvert Matrix, auto-hébergeable : à proposer aux élus et aux agents à la place des groupes WhatsApp.' },
      },
    },
  },
  {
    id: 'visio',
    label: 'Visioconférence',
    step: 'Travailler ensemble',
    minSize: 2,
    picks: {
      simple: { appId: 'ca417378-a0f2-42e4-8dac-19683938cd68', cost: 'gratuit', why: 'Visio d\'Infomaniak, sans limite de durée. Les invités rejoignent par un simple lien, sans compte.' },
      confidentiel: { appId: 'ca417378-a0f2-42e4-8dac-19683938cd68', cost: 'gratuit', why: 'Visio d\'Infomaniak, sans limite de durée. Les invités rejoignent par un simple lien, sans compte.' },
      libre: { appId: 'bigbluebutton', cost: 'libre', why: 'Visio libre auto-hébergeable, pensée pour les réunions et les formations.' },
    },
  },
  {
    id: 'agenda',
    label: 'Planifier les réunions',
    step: 'Travailler ensemble',
    minSize: 2,
    picks: {
      simple: { appId: 'doodle', cost: 'freemium', why: 'Sondages de dates pour les réunions et les assemblées, éditeur suisse. Version gratuite avec publicités.' },
      confidentiel: { appId: 'doodle', cost: 'freemium', why: 'Sondages de dates pour les réunions et les assemblées, éditeur suisse. Version gratuite avec publicités.' },
      libre: { note: 'Inclus dans Nextcloud (agenda partagé).' },
    },
  },
  {
    id: 'adherents',
    label: 'Adhérents, cotisations et comptes',
    step: 'Gérer',
    minSize: 1,
    types: ['association'],
    picks: {
      simple: { appId: 'dolibarr', cost: 'libre', why: 'Logiciel de gestion libre : adhérents, cotisations, dons et comptabilité simple. Existe en version hébergée payante chez des hébergeurs partenaires.' },
      confidentiel: { appId: 'dolibarr', cost: 'libre', why: 'Logiciel de gestion libre : adhérents, cotisations, dons et comptabilité simple.' },
      libre: { appId: 'dolibarr', cost: 'libre', why: 'Logiciel de gestion libre : adhérents, cotisations, dons et comptabilité simple.' },
    },
  },
  {
    id: 'newsletter',
    label: 'Lettre d\'information',
    step: 'Communiquer',
    minSize: 1,
    types: ['association'],
    picks: {
      simple: { appId: 'brevo', cost: 'freemium', why: 'Lettres d\'information aux adhérents, éditeur français. Gratuit jusqu\'à 300 e-mails par jour.' },
      confidentiel: { appId: 'brevo', cost: 'freemium', why: 'Lettres d\'information aux adhérents, éditeur français. Gratuit jusqu\'à 300 e-mails par jour.' },
      libre: { appId: 'brevo', cost: 'freemium', why: 'Lettres d\'information aux adhérents, éditeur français. Gratuit jusqu\'à 300 e-mails par jour.' },
    },
  },
  {
    id: 'compta',
    label: 'Facturation et comptabilité',
    step: 'Gérer',
    minSize: 1,
    types: ['tpe'],
    picks: {
      simple: { appId: 'pennylane', cost: 'payant', why: 'Facturation et comptabilité en ligne, éditeur français.' },
      confidentiel: { appId: 'dolibarr', cost: 'libre', why: 'Devis, factures et comptabilité dans un logiciel libre que vous maîtrisez.' },
      libre: { appId: 'dolibarr', cost: 'libre', why: 'Devis, factures et comptabilité sur votre serveur.' },
    },
  },
  {
    id: 'signature',
    label: 'Signature électronique',
    step: 'Gérer',
    minSize: 1,
    types: ['tpe'],
    picks: {
      simple: { appId: 'yousign', cost: 'freemium', why: 'Signature électronique de devis et contrats, éditeur français. Gratuit jusqu\'à 2 demandes de signature par mois.' },
      confidentiel: { appId: 'yousign', cost: 'freemium', why: 'Signature électronique de devis et contrats, éditeur français. Gratuit jusqu\'à 2 demandes de signature par mois.' },
      libre: { appId: 'yousign', cost: 'freemium', why: 'Signature électronique de devis et contrats, éditeur français. Gratuit jusqu\'à 2 demandes de signature par mois.' },
    },
  },
  {
    id: 'crm',
    label: 'Suivi des clients',
    step: 'Gérer',
    minSize: 2,
    types: ['tpe'],
    picks: {
      simple: { appId: 'twenty', cost: 'payant', why: 'CRM open source pour suivre clients et prospects. Version hébergée payante, gratuite si vous l\'hébergez.' },
      confidentiel: { appId: 'twenty', cost: 'payant', why: 'CRM open source pour suivre clients et prospects. Version hébergée payante, gratuite si vous l\'hébergez.' },
      libre: { appId: 'dolibarr', cost: 'libre', why: 'Le module « Tiers » de Dolibarr suit clients et prospects.' },
    },
  },
  {
    id: 'metiers',
    label: 'Logiciels métiers (état civil, élections, finances, paie)',
    step: 'Gérer',
    minSize: 1,
    types: ['collectivite'],
    picks: {
      simple: { note: METIERS_NOTE },
      confidentiel: { note: METIERS_NOTE },
      libre: { appId: 'openmairie', cost: 'libre', why: 'Logiciels libres conçus par et pour les collectivités : élections, cimetière, urbanisme, courrier. À installer par un prestataire ou votre opérateur public de services numériques.', note: METIERS_NOTE },
    },
  },
  {
    id: 'actes',
    label: 'Délibérations, parapheur et contrôle de légalité',
    step: 'Gérer',
    minSize: 1,
    types: ['collectivite'],
    picks: {
      simple: { appId: 'i-parapheur', cost: 'libre', why: 'Parapheur électronique libre de Libriciel (coopérative française), relié à la télétransmission des actes.', note: ACTES_NOTE },
      confidentiel: { appId: 'i-parapheur', cost: 'libre', why: 'Parapheur électronique libre de Libriciel (coopérative française), relié à la télétransmission des actes.', note: ACTES_NOTE },
      libre: { appId: 'i-parapheur', cost: 'libre', why: 'Parapheur électronique libre de Libriciel (coopérative française), relié à la télétransmission des actes.', note: ACTES_NOTE },
    },
  },
  {
    id: 'demarches',
    label: 'Démarches en ligne des habitants',
    step: 'Communiquer',
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
    label: 'Informer les habitants',
    step: 'Communiquer',
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
    label: 'Site web de la commune',
    step: 'Communiquer',
    minSize: 1,
    types: ['collectivite'],
    picks: {
      simple: { note: SITE_NOTE },
      confidentiel: { note: SITE_NOTE },
      libre: { appId: 'matomo', cost: 'libre', why: 'Mesure d\'audience libre et auto-hébergeable : les statistiques du site restent sur votre serveur.', note: SITE_NOTE },
    },
  },
  {
    id: 'notes',
    label: 'Notes',
    step: 'Organiser',
    minSize: 1,
    picks: {
      simple: { appId: '4cc90381-be9a-483b-8d5c-59b471737e6f', cost: 'libre', why: 'Prise de notes libre, avec synchronisation chiffrée de bout en bout possible.' },
      confidentiel: { appId: '4cc90381-be9a-483b-8d5c-59b471737e6f', cost: 'libre', why: 'Prise de notes libre, avec chiffrement de bout en bout de la synchronisation.' },
      libre: { appId: '4cc90381-be9a-483b-8d5c-59b471737e6f', cost: 'libre', why: 'Prise de notes libre, synchronisable avec Nextcloud.' },
    },
  },
  {
    id: 'taches',
    label: 'Tâches et projets',
    step: 'Organiser',
    minSize: 3,
    picks: {
      simple: { appId: 'e688f70b-cb20-4ff2-84bd-7e75ef2a0f66', cost: 'payant', why: 'Listes de tâches et tableaux partagés, libre. Version hébergée payante, gratuite si vous l\'hébergez.' },
      confidentiel: { appId: 'e688f70b-cb20-4ff2-84bd-7e75ef2a0f66', cost: 'libre', why: 'Listes de tâches et tableaux partagés, libre et auto-hébergeable.' },
      libre: { appId: 'openproject', cost: 'libre', why: 'Gestion de projet libre, éditeur allemand.' },
    },
  },
  {
    id: 'wiki',
    label: 'Documentation interne',
    step: 'Organiser',
    minSize: 3,
    picks: {
      simple: { appId: 'xwiki', cost: 'payant', why: 'Wiki libre pour les procédures et la mémoire de la structure, éditeur français. Version hébergée payante.' },
      confidentiel: { appId: 'cryptpad', cost: 'freemium', why: 'Le même outil que vos documents, chiffré de bout en bout.' },
      libre: { appId: 'bookstack', cost: 'libre', why: 'Wiki libre et simple à héberger.' },
    },
  },
  {
    id: 'ia',
    label: 'Assistant IA',
    step: 'Organiser',
    minSize: 1,
    picks: {
      simple: { appId: '1770752284146', cost: 'freemium', why: 'Assistant IA d\'un éditeur français.' },
      confidentiel: { appId: '1769540682080', cost: 'freemium', why: 'Assistant IA de Proton, axé sur la confidentialité.' },
      libre: { appId: '1770752500004', cost: 'libre', why: 'Fait tourner des modèles d\'IA ouverts sur vos propres machines.' },
    },
  },
  {
    id: 'sauvegarde',
    label: 'Sauvegardes',
    step: 'Sécuriser',
    minSize: 1,
    approaches: ['libre'],
    picks: {
      libre: { appId: 'borgbackup', cost: 'libre', why: 'Indispensable en auto-hébergement : sauvegardes chiffrées et dédupliquées du serveur.' },
    },
  },
];

/** Ordre d'affichage des étapes de mise en place. */
export const KIT_STEPS = ['Démarrer', 'Sécuriser', 'Travailler ensemble', 'Gérer', 'Communiquer', 'Organiser'];
