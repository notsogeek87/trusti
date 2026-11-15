export default {
  managers: {
    bitwarden: {
      pitch: "Open Source, auf all deinen Geräten synchronisiert, für das Wesentliche kostenlos.",
    },
    keepassdx: {
      pitch: "100 % lokal, ohne Konto: Deine Passwörter bleiben in einer Datei, die du kontrollierst.",
    },
    "proton-pass": {
      pitch: "Ende-zu-Ende-verschlüsselt, Schweizer Anbieter, Teil des Proton-Ökosystems.",
    },
  },
  practices: {
    unique: {
      title: "Ein anderes Passwort für jedes Konto",
      text: "Wird eine Website gehackt, probieren Diebe dasselbe Passwort anderswo aus. Ein eigenes Passwort begrenzt den Schaden auf ein einziges Konto.",
    },
    long: {
      title: "Lang statt kompliziert",
      text: "Eine Passphrase aus 4 oder mehr zufälligen Wörtern (oder ab 16 Zeichen) ist sicherer als ein kurzes Wort voller Sonderzeichen.",
    },
    manager: {
      title: "Ein Manager statt deines Gedächtnisses",
      text: "Ein Manager erstellt und merkt sich eigene Passwörter für dich. Du musst dir nur noch ein langes, starkes Master-Passwort merken.",
    },
    "2fa": {
      title: "Aktiviere die Zwei-Faktor-Authentifizierung (2FA)",
      text: "Ein zeitlich begrenzter Code zusätzlich zum Passwort verhindert die meisten Hacks. Nutze lieber eine Authenticator-App als SMS und schütze zuerst dein E-Mail-Konto.",
    },
    passkeys: {
      title: "Nutze Passkeys, wo immer es geht",
      text: "Ein Passkey ersetzt das Passwort durch einen Schlüssel auf deinem Gerät: Er kann weder gephisht noch wiederverwendet werden. Viele Manager können damit umgehen.",
    },
    share: {
      title: "Gib niemals ein Passwort weiter",
      text: "Kein seriöser Dienst fragt per E-Mail, SMS oder Telefon danach. Im Zweifel geh über die offizielle Website.",
    },
  },
  checks: {
    manager: {
      label: "Ich nutze einen Passwort-Manager",
    },
    "2fa-mail": {
      label: "Die Zwei-Faktor-Authentifizierung ist für mein E-Mail-Konto aktiv",
    },
    "screen-lock": {
      label: "Mein Bildschirm ist gesperrt (PIN, Fingerabdruck oder Gesicht)",
    },
    backup: {
      label: "Meine wichtigen Daten sind gesichert",
    },
    updates: {
      label: "Mein Handy und meine Apps sind aktuell",
    },
  },
  modal: {
    close: "Schließen",
    eyebrow: "Digitale Hygiene",
    title: "Deine Konten im Alltag schützen",
    intro: "Eine gute Vertrauensnote reicht nicht: Wie du deine Zugänge schützt, zählt genauso. Ein paar Gewohnheiten genügen.",
    myScore: "Mein Ergebnis · {done}/{total}",
    detectedInApps: "In deinen Apps erkannt",
    habits: "Gute Gewohnheiten",
    managers: "Empfohlene Manager",
    ecosystem: "Du nutzt {name}, das an ein Ökosystem gebunden ist. Mit einem unabhängigen Manager kannst du Handy oder Browser wechseln, ohne alles zu verlieren.",
    footer: "Offizielle Links (Play Store), ohne Affiliate. Alles, was du hier abhakst, bleibt auf deinem Gerät.",
  },
};
