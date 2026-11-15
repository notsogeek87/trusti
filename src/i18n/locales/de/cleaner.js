export default {
  filters: {
    "incomplete-downloads": {
      label: "Unvollständige Downloads",
      description: ".crdownload-, .part- oder .download-Dateien, die ein abgebrochener Download hinterlassen hat.",
    },
    "temp-files": {
      label: "Temporäre Dateien",
      description: ".tmp- und .temp-Dateien, älter als 7 Tage, ohne App-Daten.",
    },
    "orphan-thumbnails": {
      label: "Galerie-Vorschaubilder",
      description: "Vorschaubild-Cache (.thumbnails), den die Galerie automatisch neu erstellt.",
    },
    "whatsapp-statuses": {
      label: "WhatsApp-Status im Cache",
      description: "Bereits angesehene WhatsApp-Status (älter als 30 Tage) im Cache der App.",
    },
    "old-apks": {
      label: "Alte heruntergeladene APKs",
      description: ".apk-, .apks- und .xapk-Dateien im Download-Ordner, älter als 30 Tage.",
    },
    "ota-leftovers": {
      label: "Reste von Systemupdates",
      description: "Update-Archive (update.zip, ota…) im Download-Ordner, älter als 30 Tage.",
    },
    "logs-and-reports": {
      label: "Protokolle und Fehlerberichte",
      description: ".log- und .trace-Dateien sowie der Ordner bugreports, älter als 30 Tage, ohne App-Daten.",
    },
    "empty-directories": {
      label: "Leere Ordner",
      description: "Ordner ohne Inhalt seit mehr als 30 Tagen (ohne App-Daten).",
    },
  },
  section: {
    scanFailed: "Die Analyse ist fehlgeschlagen.",
    freed_one: "{size} freigegeben ({count} Element){ignored}.",
    freed_other: "{size} freigegeben ({count} Elemente){ignored}.",
    ignored_one: ", {count} übersprungen (geändert oder geschützt)",
    ignored_other: ", {count} übersprungen (geändert oder geschützt)",
    deleteFailed: "Das Löschen ist fehlgeschlagen.",
    title: "Speicher aufräumen",
    intro: "Findet unnötige Dateien (abgebrochene Downloads, temporäre Dateien, Vorschaubilder…). Die Analyse läuft nur auf deinem Handy und löscht nichts: Danach wählst du die Kategorien, die aufgeräumt werden sollen.",
    checking: "Wird geprüft…",
    allowAccess: "Dateizugriff erlauben",
    analysing: "Analyse läuft…",
    analyseAgain: "Erneut analysieren",
    analyse: "Analysieren",
    nothing: "Nichts aufzuräumen",
    items_one: "{count} Element · {size}",
    items_other: "{count} Elemente · {size}",
    truncated: "Der Speicher ist sehr groß: Die Analyse wurde begrenzt. Starte sie nach einer ersten Bereinigung erneut.",
    deleting: "Wird gelöscht…",
    confirm: "Bestätigen — endgültig löschen",
    clean_one: "{count} Element aufräumen ({size})",
    clean_other: "{count} Elemente aufräumen ({size})",
  },
};
