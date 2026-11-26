export default {
  filters: {
    "incomplete-downloads": {
      label: "Onvolledige downloads",
      description: "Bestanden .crdownload, .part of .download die een onderbroken download heeft achtergelaten.",
    },
    "temp-files": {
      label: "Tijdelijke bestanden",
      description: "Bestanden .tmp en .temp ouder dan 7 dagen, behalve appgegevens.",
    },
    "orphan-thumbnails": {
      label: "Miniaturen van de galerij",
      description: "Cache met miniaturen (.thumbnails) die de galerij automatisch opnieuw aanmaakt.",
    },
    "whatsapp-statuses": {
      label: "WhatsApp-statussen in de cache",
      description: "Al bekeken WhatsApp-statussen (ouder dan 30 dagen) die in de cache van de app bewaard zijn.",
    },
    "old-apks": {
      label: "Oude gedownloade APK's",
      description: "Bestanden .apk, .apks en .xapk in de map Downloads ouder dan 30 dagen.",
    },
    "ota-leftovers": {
      label: "Restanten van systeemupdates",
      description: "Updatebestanden (update.zip, ota…) in de map Downloads ouder dan 30 dagen.",
    },
    "logs-and-reports": {
      label: "Logbestanden en bugrapporten",
      description: "Bestanden .log, .trace en de map bugreports ouder dan 30 dagen, behalve appgegevens.",
    },
    "empty-directories": {
      label: "Lege mappen",
      description: "Mappen die al meer dan 30 dagen leeg zijn (behalve appgegevens).",
    },
  },
  section: {
    scanFailed: "De analyse is mislukt.",
    freed_one: "{size} vrijgemaakt ({count} item){ignored}.",
    freed_other: "{size} vrijgemaakt ({count} items){ignored}.",
    ignored_one: ", {count} overgeslagen (gewijzigd of beveiligd)",
    ignored_other: ", {count} overgeslagen (gewijzigd of beveiligd)",
    deleteFailed: "Het verwijderen is mislukt.",
    title: "Opslag opschonen",
    intro: "Spoort overbodige bestanden op (onderbroken downloads, tijdelijke bestanden, miniaturen…). De analyse gebeurt alleen op je telefoon en verwijdert niets: daarna kies je zelf welke categorieën je opschoont.",
    checking: "Controleren…",
    allowAccess: "Toegang tot bestanden toestaan",
    analysing: "Bezig met analyseren…",
    analyseAgain: "Opnieuw analyseren",
    analyse: "Analyseren",
    nothing: "Niets op te schonen",
    items_one: "{count} item · {size}",
    items_other: "{count} items · {size}",
    truncated: "De opslag is erg groot: de analyse is beperkt. Start hem opnieuw na een eerste opschoning.",
    deleting: "Verwijderen…",
    confirm: "Bevestigen: definitief verwijderen",
    clean_one: "{count} item opschonen ({size})",
    clean_other: "{count} items opschonen ({size})",
  },
};
