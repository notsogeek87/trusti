export default {
  steps: {
    choose: {
      title: "Alternative wählen",
      short: "Wahl",
    },
    install: {
      title: "Neue App installieren",
      short: "Installieren",
    },
    transfer: {
      title: "Daten übertragen",
      short: "Daten",
    },
    cleanup: {
      title: "Alte App verlassen",
      short: "Aufräumen",
    },
  },
  tips: {
    "0": {
      export: [
        "Exportiere den Verlauf wichtiger Unterhaltungen (Einstellungen > Chats).",
        "Notiere dir die Gruppen, die du neu anlegen musst.",
      ],
      import: [
        "Lade deine wichtigsten Kontakte in die neue App ein, bevor du die alte verlässt.",
        "Behalte die alte App für die Übergangszeit noch ein paar Tage.",
      ],
    },
    "1": {
      export: [
        "Exportiere deine Kontakte (.vcf- oder .csv-Datei).",
        "Sichere deine Nachrichten (.mbox-Archiv oder IMAP-Synchronisierung).",
      ],
      import: [
        "Importiere Kontakte und Nachrichten in das neue Postfach.",
        "Richte eine Weiterleitung von der alten Adresse ein und informiere deine Kontakte.",
      ],
    },
    "2": {
      export: [
        "Exportiere deine Zugangsdaten als CSV aus dem alten Manager.",
        "Lass diese Datei nie herumliegen: Sie ist unverschlüsselt.",
      ],
      import: [
        "Importiere die CSV-Datei in den neuen Manager und prüfe einige Konten.",
        "Lösche die CSV-Datei (und leere den Papierkorb), sobald du fertig bist.",
      ],
    },
    "3": {
      export: [
        "Lade alle deine Dateien herunter (Export des vollständigen Archivs).",
        "Prüfe die Größe des Archivs, bevor du etwas löschst.",
      ],
      import: [
        "Lade die Dateien in den neuen Dienst hoch und prüfe die Anzahl der Dateien.",
        "Aktualisiere die Links, die du mit anderen geteilt hast.",
      ],
    },
    "4": {
      export: [
        "Exportiere deine Notizen (Markdown, HTML oder eigenes Format).",
        "Denk an Anhänge und Bilder.",
      ],
      import: [
        "Importiere die Datei in die neue App und prüfe die Formatierung.",
      ],
    },
    "5": {
      export: [
        "Lade das vollständige Archiv deiner Fotos und Videos herunter.",
        "Behalte nach Möglichkeit die Metadaten (Datum, Ort).",
      ],
      import: [
        "Importiere die Fotos in den neuen Dienst und prüfe die Alben.",
      ],
    },
    "6": {
      export: [
        "Exportiere deine Playlists (Playlist-Export-Tool oder M3U-Datei).",
      ],
      import: [
        "Importiere die Playlists in die neue App und lege deine Favoriten neu an.",
      ],
    },
    "7": {
      export: [
        "Exportiere deine Lesezeichen (HTML) und bei Bedarf deine gespeicherten Passwörter.",
      ],
      import: [
        "Importiere die Lesezeichen in den neuen Browser und stelle die Standardsuchmaschine ein.",
      ],
    },
    "8": {
      export: [
        "Fordere in den Kontoeinstellungen eine Kopie deiner Daten an (Fotos, Beiträge, Kontakte).",
      ],
      import: [
        "Informiere deine Freunde über dein neues Konto und teile deinen neuen Nutzernamen.",
      ],
    },
    "9": {
      export: [
        "Lade deine Kontoauszüge und Bescheinigungen herunter, bevor du etwas kündigst.",
        "Notiere dir die Lastschriften, die umgestellt werden müssen.",
      ],
      import: [
        "Stelle Daueraufträge und Lastschriften um, bevor du das alte Konto schließt.",
      ],
    },
  },
  defaultTips: {
    export: [
      "Suche in den Einstellungen der App nach „Meine Daten exportieren“ oder „Meine Daten herunterladen“.",
      "Sichere, was du behalten möchtest (Dateien, Kontakte, Verlauf).",
    ],
    import: [
      "Importiere diese Daten in die neue App und prüfe, ob alles da ist.",
    ],
  },
  cleanup: [
    "Prüfe, ob alles übertragen wurde, bevor du das Konto löschst.",
    "Lösche das Konto in der App oder auf der Website (nicht nur die App), damit deine Daten beim Anbieter gelöscht werden.",
    "Deinstalliere die App und entziehe ihr die Zugriffe (Google-Konto, Kontakte, Benachrichtigungen).",
  ],
  modal: {
    attention: "Achtung",
    goodToKnow: "Gut zu wissen",
    source: "Quelle: offizielle Hilfe",
    uninstallFailed: "Die Deinstallation konnte nicht geöffnet werden. Versuch es über die Einstellungen deines Handys.",
    title: "Wechsel von {name}",
    progress: "{completed}/{total} Schritte erledigt",
    close: "Schließen",
    done: "Wechsel abgeschlossen!",
    doneBody: "{old} wird in „Meine Apps“ jetzt durch {new} ersetzt.",
    progressAria: "Fortschritt",
    stepAria: "Schritt {n}: {title}",
    easy: "⭐ Einfacher Wechsel · ",
    recommended: "Empfohlen · ",
    installBefore: "Installiere",
    installAfter: "bevor du {name} anrührst.",
    officialSite: "Offizielle Website",
    detected: "✓ Auf deinem Handy erkannt",
    installedCheck: "Ich habe {name} installiert",
    loadingGuide: "Anleitung wird geladen",
    exportTitle: "1. Deine Daten aus {name} holen",
    importTitle: "2. Sie in {name} übernehmen",
    transferredCheck: "Meine Daten sind übertragen",
    beforeLeaving: "Bevor du gehst",
    uninstall: "{name} deinstallieren",
    leftCheck: "Ich habe {name} verlassen",
    uninstalledCheck: "{name} ist deinstalliert",
    finish: "Wechsel abschließen",
    next: "Erledigt, nächster Schritt",
  },
};
