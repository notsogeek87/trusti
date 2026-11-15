export default {
  steps: {
    choose: {
      title: "Choisir l'alternative",
      short: "Choix",
    },
    install: {
      title: "Installer la nouvelle app",
      short: "Installer",
    },
    transfer: {
      title: "Transférer vos données",
      short: "Données",
    },
    cleanup: {
      title: "Quitter l'ancienne app",
      short: "Nettoyer",
    },
  },
  tips: {
    "0": {
      export: [
        "Exportez l'historique des conversations importantes (réglages > discussions).",
        "Notez les groupes à recréer.",
      ],
      import: [
        "Invitez vos contacts clés vers la nouvelle app avant de quitter l'ancienne.",
        "Gardez l'ancienne app quelques jours pour la transition.",
      ],
    },
    "1": {
      export: [
        "Exportez vos contacts (fichier .vcf ou .csv).",
        "Sauvegardez vos messages (archive .mbox ou synchronisation IMAP).",
      ],
      import: [
        "Importez les contacts et les messages dans la nouvelle boîte.",
        "Activez une redirection depuis l'ancienne adresse et prévenez vos correspondants.",
      ],
    },
    "2": {
      export: [
        "Exportez vos identifiants en CSV depuis l'ancien gestionnaire.",
        "Ne laissez jamais ce fichier traîner : il est en clair.",
      ],
      import: [
        "Importez le CSV dans le nouveau gestionnaire, puis vérifiez quelques comptes.",
        "Supprimez le fichier CSV (et la corbeille) dès que c'est fait.",
      ],
    },
    "3": {
      export: [
        "Téléchargez l'intégralité de vos fichiers (export de l'archive complète).",
        "Vérifiez la taille de l'archive avant de supprimer quoi que ce soit.",
      ],
      import: [
        "Déposez les fichiers dans le nouveau service et contrôlez le nombre de fichiers.",
        "Mettez à jour les liens partagés avec vos proches.",
      ],
    },
    "4": {
      export: [
        "Exportez vos notes (Markdown, HTML ou format dédié).",
        "Pensez aux pièces jointes et aux images.",
      ],
      import: [
        "Importez le fichier dans la nouvelle app et vérifiez la mise en forme.",
      ],
    },
    "5": {
      export: [
        "Téléchargez l'archive complète de vos photos et vidéos.",
        "Conservez les métadonnées (dates, lieux) si possible.",
      ],
      import: [
        "Importez les photos dans le nouveau service et vérifiez les albums.",
      ],
    },
    "6": {
      export: [
        "Exportez vos playlists (outil d'export de playlists ou fichier M3U).",
      ],
      import: [
        "Importez les playlists dans la nouvelle app, puis recréez vos favoris.",
      ],
    },
    "7": {
      export: [
        "Exportez vos marque-pages (HTML) et, si besoin, vos mots de passe enregistrés.",
      ],
      import: [
        "Importez les marque-pages dans le nouveau navigateur et réglez le moteur de recherche par défaut.",
      ],
    },
    "8": {
      export: [
        "Demandez une copie de vos données (photos, publications, contacts) dans les paramètres du compte.",
      ],
      import: [
        "Prévenez vos proches de votre nouveau compte et partagez votre nouveau pseudo.",
      ],
    },
    "9": {
      export: [
        "Téléchargez vos relevés et attestations avant toute clôture.",
        "Notez les prélèvements à rediriger.",
      ],
      import: [
        "Redirigez les virements et prélèvements récurrents avant de fermer l'ancien compte.",
      ],
    },
  },
  defaultTips: {
    export: [
      "Cherchez « Exporter mes données » ou « Télécharger mes données » dans les paramètres de l'app.",
      "Sauvegardez ce que vous voulez garder (fichiers, contacts, historique).",
    ],
    import: [
      "Importez ces données dans la nouvelle app et vérifiez que tout est là.",
    ],
  },
  cleanup: [
    "Vérifiez que tout est transféré avant de supprimer le compte.",
    "Supprimez le compte dans l'app ou sur le site (pas seulement l'app) pour effacer vos données chez l'éditeur.",
    "Désinstallez l'app, puis retirez ses accès (compte Google, contacts, notifications).",
  ],
  modal: {
    attention: "Attention",
    goodToKnow: "À savoir",
    source: "Source : aide officielle",
    uninstallFailed: "Impossible d'ouvrir la désinstallation. Réessayez depuis les paramètres du téléphone.",
    title: "Migrer depuis {name}",
    progress: "{completed}/{total} étapes faites",
    close: "Fermer",
    done: "Migration terminée !",
    doneBody: "{old} est désormais remplacée par {new} dans « Mes Apps ».",
    progressAria: "Progression",
    stepAria: "Étape {n} : {title}",
    easy: "⭐ Migration facile · ",
    recommended: "Recommandée · ",
    installBefore: "Installez",
    installAfter: "avant de toucher à {name}.",
    officialSite: "Site officiel",
    detected: "✓ Détectée sur votre téléphone",
    installedCheck: "J'ai installé {name}",
    loadingGuide: "Chargement du guide",
    exportTitle: "1. Récupérer vos données de {name}",
    importTitle: "2. Les mettre dans {name}",
    transferredCheck: "Mes données sont transférées",
    beforeLeaving: "Avant de partir",
    uninstall: "Désinstaller {name}",
    leftCheck: "J'ai quitté {name}",
    uninstalledCheck: "{name} est désinstallée",
    finish: "Terminer la migration",
    next: "C'est fait, étape suivante",
  },
};
