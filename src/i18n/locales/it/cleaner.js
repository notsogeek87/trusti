export default {
  filters: {
    "incomplete-downloads": {
      label: "Download incompleti",
      description: "File .crdownload, .part o .download lasciati da un download interrotto.",
    },
    "temp-files": {
      label: "File temporanei",
      description: "File .tmp e .temp più vecchi di 7 giorni, esclusi i dati delle app.",
    },
    "orphan-thumbnails": {
      label: "Miniature della galleria",
      description: "Cache delle miniature (.thumbnails) rigenerata automaticamente dalla galleria.",
    },
    "whatsapp-statuses": {
      label: "Stati WhatsApp in cache",
      description: "Stati WhatsApp già visti (più vecchi di 30 giorni) conservati nella cache dell'app.",
    },
    "old-apks": {
      label: "Vecchi APK scaricati",
      description: "File .apk, .apks e .xapk della cartella Download più vecchi di 30 giorni.",
    },
    "ota-leftovers": {
      label: "Residui di aggiornamenti di sistema",
      description: "Archivi di aggiornamento (update.zip, ota…) della cartella Download più vecchi di 30 giorni.",
    },
    "logs-and-reports": {
      label: "Log e segnalazioni di bug",
      description: "File .log, .trace e cartella bugreports più vecchi di 30 giorni, esclusi i dati delle app.",
    },
    "empty-directories": {
      label: "Cartelle vuote",
      description: "Cartelle senza alcun contenuto da più di 30 giorni (esclusi i dati delle app).",
    },
  },
  section: {
    scanFailed: "L'analisi non è riuscita.",
    freed_one: "{size} liberati ({count} elemento){ignored}.",
    freed_other: "{size} liberati ({count} elementi){ignored}.",
    ignored_one: ", {count} ignorato (modificato o protetto)",
    ignored_other: ", {count} ignorati (modificati o protetti)",
    deleteFailed: "L'eliminazione non è riuscita.",
    title: "Pulisci la memoria",
    intro: "Individua i file inutili (download interrotti, file temporanei, miniature…). L'analisi avviene solo sul tuo telefono e non elimina nulla: poi scegli tu le categorie da pulire.",
    checking: "Verifica…",
    allowAccess: "Consenti l'accesso ai file",
    analysing: "Analisi in corso…",
    analyseAgain: "Analizza di nuovo",
    analyse: "Analizza",
    nothing: "Niente da pulire",
    items_one: "{count} elemento · {size}",
    items_other: "{count} elementi · {size}",
    truncated: "La memoria è molto grande: l'analisi è stata limitata. Rilanciala dopo una prima pulizia.",
    deleting: "Eliminazione…",
    confirm: "Conferma: eliminazione definitiva",
    clean_one: "Pulisci {count} elemento ({size})",
    clean_other: "Pulisci {count} elementi ({size})",
  },
};
