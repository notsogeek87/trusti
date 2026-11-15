export default {
  filters: {
    "incomplete-downloads": {
      label: "Téléchargements incomplets",
      description: "Fichiers .crdownload, .part ou .download laissés par un téléchargement interrompu.",
    },
    "temp-files": {
      label: "Fichiers temporaires",
      description: "Fichiers .tmp et .temp de plus de 7 jours, hors données des apps.",
    },
    "orphan-thumbnails": {
      label: "Miniatures de galerie",
      description: "Cache de miniatures (.thumbnails) régénéré automatiquement par la galerie.",
    },
    "whatsapp-statuses": {
      label: "Statuts WhatsApp en cache",
      description: "Statuts WhatsApp déjà consultés (de plus de 30 jours) conservés dans le cache de l'app.",
    },
    "old-apks": {
      label: "Anciens APK téléchargés",
      description: "Fichiers .apk, .apks et .xapk du dossier Téléchargements de plus de 30 jours.",
    },
    "ota-leftovers": {
      label: "Restes de mises à jour système",
      description: "Archives de mise à jour (update.zip, ota…) du dossier Téléchargements de plus de 30 jours.",
    },
    "logs-and-reports": {
      label: "Journaux et rapports de bug",
      description: "Fichiers .log, .trace et dossier bugreports de plus de 30 jours, hors données des apps.",
    },
    "empty-directories": {
      label: "Dossiers vides",
      description: "Dossiers sans aucun contenu depuis plus de 30 jours (hors données des apps).",
    },
  },
  section: {
    scanFailed: "L'analyse a échoué.",
    freed_one: "{size} libérés ({count} élément){ignored}.",
    freed_other: "{size} libérés ({count} éléments){ignored}.",
    ignored_one: ", {count} ignoré (modifié ou protégé)",
    ignored_other: ", {count} ignorés (modifiés ou protégés)",
    deleteFailed: "La suppression a échoué.",
    title: "Nettoyer le stockage",
    intro: "Repère les fichiers inutiles (téléchargements interrompus, temporaires, miniatures…). L'analyse se fait uniquement sur votre téléphone et ne supprime rien : vous choisissez ensuite les catégories à nettoyer.",
    checking: "Vérification…",
    allowAccess: "Autoriser l'accès aux fichiers",
    analysing: "Analyse en cours…",
    analyseAgain: "Analyser à nouveau",
    analyse: "Analyser",
    nothing: "Rien à nettoyer",
    items_one: "{count} élément · {size}",
    items_other: "{count} éléments · {size}",
    truncated: "Le stockage est très volumineux : l'analyse a été limitée. Relancez-la après un premier nettoyage.",
    deleting: "Suppression…",
    confirm: "Confirmer — suppression définitive",
    clean_one: "Nettoyer {count} élément ({size})",
    clean_other: "Nettoyer {count} éléments ({size})",
  },
};
