export default {
  steps: {
    choose: {
      title: "Scegli l'alternativa",
      short: "Scelta",
    },
    install: {
      title: "Installa la nuova app",
      short: "Installa",
    },
    transfer: {
      title: "Trasferisci i tuoi dati",
      short: "Dati",
    },
    cleanup: {
      title: "Lascia la vecchia app",
      short: "Pulisci",
    },
  },
  tips: {
    "0": {
      export: [
        "Esporta la cronologia delle conversazioni importanti (impostazioni > chat).",
        "Annota i gruppi da ricreare.",
      ],
      import: [
        "Invita i tuoi contatti principali nella nuova app prima di lasciare la vecchia.",
        "Tieni la vecchia app per qualche giorno durante la transizione.",
      ],
    },
    "1": {
      export: [
        "Esporta i tuoi contatti (file .vcf o .csv).",
        "Salva i tuoi messaggi (archivio .mbox o sincronizzazione IMAP).",
      ],
      import: [
        "Importa contatti e messaggi nella nuova casella.",
        "Attiva un inoltro dal vecchio indirizzo e avvisa i tuoi corrispondenti.",
      ],
    },
    "2": {
      export: [
        "Esporta le tue credenziali in CSV dal vecchio gestore.",
        "Non lasciare mai in giro questo file: è in chiaro.",
      ],
      import: [
        "Importa il CSV nel nuovo gestore, poi controlla qualche account.",
        "Elimina il file CSV (e svuota il cestino) appena hai finito.",
      ],
    },
    "3": {
      export: [
        "Scarica tutti i tuoi file (esportazione dell'archivio completo).",
        "Controlla la dimensione dell'archivio prima di eliminare qualsiasi cosa.",
      ],
      import: [
        "Carica i file nel nuovo servizio e controlla il numero di file.",
        "Aggiorna i link condivisi con le persone a te vicine.",
      ],
    },
    "4": {
      export: [
        "Esporta le tue note (Markdown, HTML o formato dedicato).",
        "Pensa agli allegati e alle immagini.",
      ],
      import: [
        "Importa il file nella nuova app e controlla la formattazione.",
      ],
    },
    "5": {
      export: [
        "Scarica l'archivio completo di foto e video.",
        "Conserva i metadati (date, luoghi) se possibile.",
      ],
      import: [
        "Importa le foto nel nuovo servizio e controlla gli album.",
      ],
    },
    "6": {
      export: [
        "Esporta le tue playlist (strumento di esportazione delle playlist o file M3U).",
      ],
      import: [
        "Importa le playlist nella nuova app, poi ricrea i preferiti.",
      ],
    },
    "7": {
      export: [
        "Esporta i segnalibri (HTML) e, se serve, le password salvate.",
      ],
      import: [
        "Importa i segnalibri nel nuovo browser e imposta il motore di ricerca predefinito.",
      ],
    },
    "8": {
      export: [
        "Richiedi una copia dei tuoi dati (foto, post, contatti) nelle impostazioni dell'account.",
      ],
      import: [
        "Avvisa le persone a te vicine del nuovo account e condividi il tuo nuovo nome utente.",
      ],
    },
    "9": {
      export: [
        "Scarica estratti conto e attestazioni prima di qualsiasi chiusura.",
        "Annota gli addebiti diretti da spostare.",
      ],
      import: [
        "Sposta bonifici e addebiti ricorrenti prima di chiudere il vecchio conto.",
      ],
    },
  },
  defaultTips: {
    export: [
      "Cerca «Esporta i miei dati» o «Scarica i miei dati» nelle impostazioni dell'app.",
      "Salva ciò che vuoi tenere (file, contatti, cronologia).",
    ],
    import: [
      "Importa questi dati nella nuova app e controlla che ci sia tutto.",
    ],
  },
  cleanup: [
    "Controlla che tutto sia stato trasferito prima di eliminare l'account.",
    "Elimina l'account nell'app o sul sito (non solo l'app) per cancellare i tuoi dati presso l'editore.",
    "Disinstalla l'app, poi revoca i suoi accessi (account Google, contatti, notifiche).",
  ],
  modal: {
    attention: "Attenzione",
    goodToKnow: "Da sapere",
    source: "Fonte: guida ufficiale",
    uninstallFailed: "Impossibile aprire la disinstallazione. Riprova dalle impostazioni del telefono.",
    title: "Migrare da {name}",
    progress: "{completed}/{total} passaggi fatti",
    close: "Chiudi",
    done: "Migrazione completata!",
    doneBody: "{old} è ora sostituita da {new} in «Le mie app».",
    progressAria: "Avanzamento",
    stepAria: "Passaggio {n}: {title}",
    easy: "⭐ Migrazione facile · ",
    recommended: "Consigliata · ",
    installBefore: "Installa",
    installAfter: "prima di toccare {name}.",
    officialSite: "Sito ufficiale",
    detected: "✓ Rilevata sul tuo telefono",
    installedCheck: "Ho installato {name}",
    loadingGuide: "Caricamento della guida",
    exportTitle: "1. Recupera i tuoi dati da {name}",
    importTitle: "2. Mettili in {name}",
    transferredCheck: "I miei dati sono trasferiti",
    beforeLeaving: "Prima di andartene",
    uninstall: "Disinstalla {name}",
    leftCheck: "Ho lasciato {name}",
    uninstalledCheck: "{name} è disinstallata",
    finish: "Completa la migrazione",
    next: "Fatto, passaggio successivo",
  },
};
