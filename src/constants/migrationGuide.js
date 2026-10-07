/**
 * Contenu du parcours « Migration guidée » (voir MigrationGuideModal).
 * Textes en français adulte uniquement pour l'instant.
 */

// Étapes du parcours, dans l'ordre. `id` sert de clé de progression stockée.
export const MIGRATION_STEPS = [
  { id: 'choose', title: 'Choisir l\'alternative', short: 'Choix' },
  { id: 'install', title: 'Installer la nouvelle app', short: 'Installer' },
  { id: 'transfer', title: 'Transférer vos données', short: 'Données' },
  { id: 'cleanup', title: 'Quitter l\'ancienne app', short: 'Nettoyer' },
];

// Conseils d'export / d'import selon la catégorie de l'app remplacée. Le
// premier motif (sous-chaîne, insensible à la casse) qui correspond gagne.
export const DATA_TIPS = [
  {
    match: ['messagerie', 'communication', 'visioconf'],
    export: ['Exportez l\'historique des conversations importantes (réglages > discussions).', 'Notez les groupes à recréer.'],
    import: ['Invitez vos contacts clés vers la nouvelle app avant de quitter l\'ancienne.', 'Gardez l\'ancienne app quelques jours pour la transition.'],
  },
  {
    match: ['email', 'mail'],
    export: ['Exportez vos contacts (fichier .vcf ou .csv).', 'Sauvegardez vos messages (archive .mbox ou synchronisation IMAP).'],
    import: ['Importez les contacts et les messages dans la nouvelle boîte.', 'Activez une redirection depuis l\'ancienne adresse et prévenez vos correspondants.'],
  },
  {
    match: ['mot de passe', 'mots de passe'],
    export: ['Exportez vos identifiants en CSV depuis l\'ancien gestionnaire.', 'Ne laissez jamais ce fichier traîner : il est en clair.'],
    import: ['Importez le CSV dans le nouveau gestionnaire, puis vérifiez quelques comptes.', 'Supprimez le fichier CSV (et la corbeille) dès que c\'est fait.'],
  },
  {
    match: ['stockage cloud', 'cloud'],
    export: ['Téléchargez l\'intégralité de vos fichiers (export de l\'archive complète).', 'Vérifiez la taille de l\'archive avant de supprimer quoi que ce soit.'],
    import: ['Déposez les fichiers dans le nouveau service et contrôlez le nombre de fichiers.', 'Mettez à jour les liens partagés avec vos proches.'],
  },
  {
    match: ['prise de notes', 'notes'],
    export: ['Exportez vos notes (Markdown, HTML ou format dédié).', 'Pensez aux pièces jointes et aux images.'],
    import: ['Importez le fichier dans la nouvelle app et vérifiez la mise en forme.'],
  },
  {
    match: ['photo'],
    export: ['Téléchargez l\'archive complète de vos photos et vidéos.', 'Conservez les métadonnées (dates, lieux) si possible.'],
    import: ['Importez les photos dans le nouveau service et vérifiez les albums.'],
  },
  {
    match: ['streaming musical', 'musique'],
    export: ['Exportez vos playlists (outil d\'export de playlists ou fichier M3U).'],
    import: ['Importez les playlists dans la nouvelle app, puis recréez vos favoris.'],
  },
  {
    match: ['navigateur', 'moteur'],
    export: ['Exportez vos marque-pages (HTML) et, si besoin, vos mots de passe enregistrés.'],
    import: ['Importez les marque-pages dans le nouveau navigateur et réglez le moteur de recherche par défaut.'],
  },
  {
    match: ['réseaux sociaux', 'rencontres'],
    export: ['Demandez une copie de vos données (photos, publications, contacts) dans les paramètres du compte.'],
    import: ['Prévenez vos proches de votre nouveau compte et partagez votre nouveau pseudo.'],
  },
  {
    match: ['banque', 'finance', 'paiement'],
    export: ['Téléchargez vos relevés et attestations avant toute clôture.', 'Notez les prélèvements à rediriger.'],
    import: ['Redirigez les virements et prélèvements récurrents avant de fermer l\'ancien compte.'],
  },
];

// Conseils génériques quand aucune catégorie ne correspond.
export const DEFAULT_DATA_TIPS = {
  export: ['Cherchez « Exporter mes données » ou « Télécharger mes données » dans les paramètres de l\'app.', 'Sauvegardez ce que vous voulez garder (fichiers, contacts, historique).'],
  import: ['Importez ces données dans la nouvelle app et vérifiez que tout est là.'],
};

// Conseils pour quitter proprement l'ancienne app.
export const CLEANUP_TIPS = [
  'Vérifiez que tout est transféré avant de supprimer le compte.',
  'Supprimez le compte dans l\'app ou sur le site (pas seulement l\'app) pour effacer vos données chez l\'éditeur.',
  'Désinstallez l\'app, puis retirez ses accès (compte Google, contacts, notifications).',
];
