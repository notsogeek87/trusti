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
  { id: 'oui', label: 'Oui' },
  { id: 'non', label: 'Non' },
  { id: 'nsp', label: 'Je ne sais pas' },
];

export const AUDIT_WEIGHTS = {
  haute: { label: 'Prioritaire', rank: 0 },
  moyenne: { label: 'À prévoir', rank: 1 },
};

export const AUDIT_THEMES = [
  'Comptes et accès',
  'Postes et sauvegardes',
  'Messagerie et échanges',
  'Données personnelles',
  'Contrats et réversibilité',
  'Organisation',
];

export const AUDIT_QUESTIONS = [
  // Comptes et accès
  {
    id: 'mfa',
    theme: 'Comptes et accès',
    label: 'La double authentification est-elle activée sur la messagerie et les outils en ligne ?',
    riskAnswer: 'non',
    weight: 'haute',
    recommendation: 'Activer la double authentification, en commençant par la messagerie : c\'est la porte d\'entrée de la plupart des piratages.',
  },
  {
    id: 'comptes-partages',
    theme: 'Comptes et accès',
    label: 'Des identifiants sont-ils partagés entre plusieurs personnes (un même mot de passe pour tout le service) ?',
    riskAnswer: 'oui',
    weight: 'haute',
    recommendation: 'Un compte par personne ; les accès communs sont rangés dans un gestionnaire de mots de passe d\'équipe.',
  },
  {
    id: 'gestionnaire-mdp',
    theme: 'Comptes et accès',
    label: 'Les mots de passe sont-ils rangés dans un gestionnaire de mots de passe (pas dans un carnet ou un tableur) ?',
    riskAnswer: 'non',
    weight: 'moyenne',
    recommendation: 'Mettre en place un gestionnaire de mots de passe (Bitwarden, Passbolt, KeePassXC…) et y ranger les accès de la structure.',
  },
  {
    id: 'departs',
    theme: 'Comptes et accès',
    label: 'Les accès d\'une personne qui part (agent, élu en fin de mandat, bénévole, salarié) sont-ils retirés le jour de son départ ?',
    riskAnswer: 'non',
    weight: 'haute',
    recommendation: 'Tenir la liste des accès de chaque personne et la passer en revue à chaque départ, et après chaque élection.',
  },
  // Postes et sauvegardes
  {
    id: 'mises-a-jour',
    theme: 'Postes et sauvegardes',
    label: 'Tous les ordinateurs ont-ils un système encore maintenu, qui reçoit les mises à jour de sécurité ?',
    help: 'Windows 10 ne reçoit plus de correctifs gratuits depuis le 14 octobre 2025.',
    riskAnswer: 'non',
    weight: 'haute',
    recommendation: 'Mettre à jour ou remplacer les postes dont le système n\'est plus maintenu ; un poste récent sous Linux est aussi une option.',
  },
  {
    id: 'appareils-perso',
    theme: 'Postes et sauvegardes',
    label: 'Des données de la structure sont-elles traitées sur des ordinateurs ou téléphones personnels ?',
    riskAnswer: 'oui',
    weight: 'moyenne',
    recommendation: 'Fournir les outils nécessaires, ou fixer des règles minimales pour les appareils personnels (verrouillage, mises à jour, pas de copie locale).',
  },
  {
    id: 'sauvegarde',
    theme: 'Postes et sauvegardes',
    label: 'Existe-t-il une sauvegarde régulière des données, dont une copie déconnectée ou hors des locaux ?',
    riskAnswer: 'non',
    weight: 'haute',
    recommendation: 'Règle 3-2-1 : trois copies, sur deux supports, dont une hors des locaux et déconnectée, pour résister à un rançongiciel.',
  },
  {
    id: 'restauration',
    theme: 'Postes et sauvegardes',
    label: 'Une restauration de sauvegarde a-t-elle été testée au cours des douze derniers mois ?',
    riskAnswer: 'non',
    weight: 'moyenne',
    recommendation: 'Tester une restauration au moins une fois par an : une sauvegarde jamais relue n\'est pas une sauvegarde.',
  },
  // Messagerie et échanges
  {
    id: 'nom-de-domaine',
    theme: 'Messagerie et échanges',
    label: 'La structure a-t-elle son propre nom de domaine pour son site et ses adresses e-mail ?',
    help: 'Exemple : contact@mairie-saint-clement.fr plutôt que mairie.saintclement@orange.fr.',
    riskAnswer: 'non',
    weight: 'moyenne',
    recommendation: 'Réserver un nom de domaine à son nom : les habitants, clients ou adhérents reconnaissent l\'expéditeur et les adresses survivent aux changements de fournisseur.',
  },
  {
    id: 'messagerie-gratuite',
    theme: 'Messagerie et échanges',
    label: 'Des adresses e-mail gratuites grand public (Gmail, Orange, Free, Laposte.net…) servent-elles au travail ?',
    riskAnswer: 'oui',
    weight: 'moyenne',
    recommendation: 'Passer à une messagerie professionnelle chez un fournisseur européen, au nom de domaine de la structure.',
  },
  {
    id: 'elus-adresse-perso',
    theme: 'Messagerie et échanges',
    profiles: ['collectivite'],
    label: 'Des élus utilisent-ils leur adresse e-mail personnelle pour les affaires de la commune ?',
    riskAnswer: 'oui',
    weight: 'moyenne',
    recommendation: 'Donner une adresse de la commune à chaque élu : les échanges restent à la commune à la fin du mandat.',
  },
  {
    id: 'messagerie-instantanee',
    theme: 'Messagerie et échanges',
    label: 'Les échanges de travail passent-ils par WhatsApp, Messenger ou des SMS ?',
    riskAnswer: 'oui',
    weight: 'moyenne',
    recommendation: 'Proposer une messagerie chiffrée européenne (Olvid, Element…) pour les échanges de travail, en particulier les groupes d\'élus ou de bureau.',
  },
  {
    id: 'site-traceurs',
    theme: 'Messagerie et échanges',
    label: 'Le site web affiche-t-il des services de Google ou de Meta (statistiques, vidéos, cartes, boutons de partage) ?',
    riskAnswer: 'oui',
    weight: 'moyenne',
    recommendation: 'Remplacer les services tiers du site (Matomo pour les statistiques, cartes OpenStreetMap, vidéos hébergées) et ne les charger qu\'après consentement.',
  },
  // Données personnelles
  {
    id: 'dpo',
    theme: 'Données personnelles',
    profiles: ['collectivite'],
    label: 'Un délégué à la protection des données (DPO) est-il désigné ?',
    help: 'Obligatoire pour toute collectivité, quelle que soit sa taille.',
    riskAnswer: 'non',
    weight: 'haute',
    recommendation: 'Désigner un DPO : il est souvent mutualisé par le centre de gestion, l\'intercommunalité ou l\'opérateur public de services numériques.',
  },
  {
    id: 'registre',
    theme: 'Données personnelles',
    label: 'Un registre des traitements de données personnelles est-il tenu à jour ?',
    riskAnswer: 'non',
    weight: 'moyenne',
    recommendation: 'Tenir le registre des traitements (modèles et guides gratuits sur cnil.fr).',
  },
  {
    id: 'donnees-sensibles',
    theme: 'Données personnelles',
    profiles: ['collectivite', 'sante', 'enseignement', 'association'],
    label: 'Les données sensibles (état civil, aide sociale, santé, mineurs) sont-elles dans des outils notés A ou B, avec un accès limité aux seules personnes concernées ?',
    riskAnswer: 'non',
    weight: 'haute',
    recommendation: 'Recenser les outils qui contiennent des données sensibles, restreindre leurs accès et les passer en priorité vers des outils notés A ou B.',
  },
  // Contrats et réversibilité
  {
    id: 'export-donnees',
    theme: 'Contrats et réversibilité',
    label: 'Pouvez-vous exporter toutes les données de vos logiciels principaux dans un format ouvert (CSV, ODS, PDF…) ?',
    riskAnswer: 'non',
    weight: 'haute',
    recommendation: 'Vérifier l\'export complet dans chaque logiciel vital et l\'exiger au contrat avant le prochain renouvellement : sans export, changer d\'éditeur est presque impossible.',
  },
  {
    id: 'contrats-hebergement',
    theme: 'Contrats et réversibilité',
    label: 'Les contrats indiquent-ils où sont hébergées les données et comment elles sont restituées en fin de contrat ?',
    riskAnswer: 'non',
    weight: 'moyenne',
    recommendation: 'Demander à chaque éditeur le lieu d\'hébergement, les sous-traitants et la procédure de restitution, et les faire inscrire au contrat.',
  },
  // Organisation
  {
    id: 'referent',
    theme: 'Organisation',
    label: 'Une personne est-elle chargée de suivre le numérique (référent interne ou prestataire identifié) ?',
    riskAnswer: 'non',
    weight: 'moyenne',
    recommendation: 'Désigner un référent numérique, même à temps partiel, qui tient l\'inventaire des outils et des accès.',
  },
  {
    id: 'incident',
    theme: 'Organisation',
    label: 'Savez-vous quoi faire et qui appeler en cas de piratage ou de rançongiciel ?',
    riskAnswer: 'non',
    weight: 'moyenne',
    recommendation: 'Écrire la marche à suivre (débrancher du réseau, ne pas payer, prévenir le prestataire, l\'assurance et 17Cyber) et la garder aussi sur papier.',
  },
];
