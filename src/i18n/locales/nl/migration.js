export default {
  steps: {
    choose: {
      title: "Het alternatief kiezen",
      short: "Keuze",
    },
    install: {
      title: "De nieuwe app installeren",
      short: "Installeren",
    },
    transfer: {
      title: "Je gegevens overzetten",
      short: "Gegevens",
    },
    cleanup: {
      title: "De oude app verlaten",
      short: "Opruimen",
    },
  },
  tips: {
    "0": {
      export: [
        "Exporteer de geschiedenis van belangrijke gesprekken (instellingen > chats).",
        "Noteer welke groepen je opnieuw moet aanmaken.",
      ],
      import: [
        "Nodig je belangrijkste contacten uit voor de nieuwe app voordat je de oude verlaat.",
        "Houd de oude app nog een paar dagen voor de overgang.",
      ],
    },
    "1": {
      export: [
        "Exporteer je contacten (bestand .vcf of .csv).",
        "Bewaar je berichten (archief .mbox of IMAP-synchronisatie).",
      ],
      import: [
        "Importeer de contacten en berichten in de nieuwe mailbox.",
        "Stel een doorsturing in vanaf het oude adres en laat je contacten het weten.",
      ],
    },
    "2": {
      export: [
        "Exporteer je inloggegevens als CSV uit de oude beheerder.",
        "Laat dit bestand nooit rondslingeren: het is onversleuteld.",
      ],
      import: [
        "Importeer de CSV in de nieuwe beheerder en controleer een paar accounts.",
        "Verwijder het CSV-bestand (en leeg de prullenbak) zodra je klaar bent.",
      ],
    },
    "3": {
      export: [
        "Download al je bestanden (export van het volledige archief).",
        "Controleer de grootte van het archief voordat je iets verwijdert.",
      ],
      import: [
        "Zet de bestanden in de nieuwe dienst en controleer het aantal bestanden.",
        "Werk de links bij die je met je naasten deelt.",
      ],
    },
    "4": {
      export: [
        "Exporteer je notities (Markdown, HTML of een eigen formaat).",
        "Denk aan bijlagen en afbeeldingen.",
      ],
      import: [
        "Importeer het bestand in de nieuwe app en controleer de opmaak.",
      ],
    },
    "5": {
      export: [
        "Download het volledige archief van je foto's en video's.",
        "Bewaar de metadata (datums, locaties) als dat kan.",
      ],
      import: [
        "Importeer de foto's in de nieuwe dienst en controleer de albums.",
      ],
    },
    "6": {
      export: [
        "Exporteer je afspeellijsten (exporttool voor playlists of M3U-bestand).",
      ],
      import: [
        "Importeer de afspeellijsten in de nieuwe app en maak je favorieten opnieuw aan.",
      ],
    },
    "7": {
      export: [
        "Exporteer je bladwijzers (HTML) en zo nodig je opgeslagen wachtwoorden.",
      ],
      import: [
        "Importeer de bladwijzers in de nieuwe browser en stel de standaardzoekmachine in.",
      ],
    },
    "8": {
      export: [
        "Vraag een kopie van je gegevens aan (foto's, berichten, contacten) in de accountinstellingen.",
      ],
      import: [
        "Laat je naasten weten wat je nieuwe account is en deel je nieuwe gebruikersnaam.",
      ],
    },
    "9": {
      export: [
        "Download je afschriften en attesten voordat je iets opzegt.",
        "Noteer welke automatische incasso's je moet omzetten.",
      ],
      import: [
        "Zet terugkerende overschrijvingen en incasso's om voordat je de oude rekening sluit.",
      ],
    },
  },
  defaultTips: {
    export: [
      "Zoek naar 'Mijn gegevens exporteren' of 'Mijn gegevens downloaden' in de instellingen van de app.",
      "Bewaar wat je wilt houden (bestanden, contacten, geschiedenis).",
    ],
    import: [
      "Importeer deze gegevens in de nieuwe app en controleer of alles er is.",
    ],
  },
  cleanup: [
    "Controleer of alles is overgezet voordat je het account verwijdert.",
    "Verwijder het account in de app of op de website (niet alleen de app) zodat de uitgever je gegevens wist.",
    "Verwijder de app en trek de toegang in (Google-account, contacten, meldingen).",
  ],
  modal: {
    attention: "Let op",
    goodToKnow: "Goed om te weten",
    source: "Bron: officiële hulppagina",
    uninstallFailed: "Kan het verwijderen niet openen. Probeer het via de instellingen van je telefoon.",
    title: "Overstappen van {name}",
    progress: "{completed}/{total} stappen gedaan",
    close: "Sluiten",
    done: "Migratie voltooid!",
    doneBody: "{old} is nu vervangen door {new} in 'Mijn apps'.",
    progressAria: "Voortgang",
    stepAria: "Stap {n}: {title}",
    easy: "⭐ Makkelijke migratie · ",
    recommended: "Aanbevolen · ",
    installBefore: "Installeer",
    installAfter: "voordat je aan {name} komt.",
    officialSite: "Officiële website",
    detected: "✓ Gevonden op je telefoon",
    installedCheck: "Ik heb {name} geïnstalleerd",
    loadingGuide: "Gids laden",
    exportTitle: "1. Je gegevens uit {name} halen",
    importTitle: "2. Ze in {name} zetten",
    transferredCheck: "Mijn gegevens zijn overgezet",
    beforeLeaving: "Voor je vertrekt",
    uninstall: "{name} verwijderen",
    leftCheck: "Ik heb {name} verlaten",
    uninstalledCheck: "{name} is verwijderd",
    finish: "Migratie afronden",
    next: "Gedaan, volgende stap",
  },
};
