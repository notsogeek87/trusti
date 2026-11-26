export default {
  managers: {
    bitwarden: {
      pitch: "Open source, sincronizzato su tutti i tuoi dispositivi, gratuito per l'essenziale.",
    },
    keepassdx: {
      pitch: "100% locale, senza account: le tue password restano in un file che controlli tu.",
    },
    "proton-pass": {
      pitch: "Crittografia end-to-end, editore svizzero, integrato nell'ecosistema Proton.",
    },
  },
  practices: {
    unique: {
      title: "Una password diversa per ogni account",
      text: "Se un sito viene violato, i ladri provano la stessa password altrove. Una password unica limita i danni a un solo account.",
    },
    long: {
      title: "Lunga piuttosto che complicata",
      text: "Una passphrase di 4 o più parole casuali (o di almeno 16 caratteri) resiste meglio di una parola corta piena di simboli.",
    },
    manager: {
      title: "Un gestore invece della tua memoria",
      text: "Un gestore genera e ricorda password uniche al posto tuo. Devi ricordare solo una password principale, lunga e robusta.",
    },
    "2fa": {
      title: "Attiva l'autenticazione a due fattori (2FA)",
      text: "Un codice temporaneo oltre alla password blocca la maggior parte degli attacchi. Preferisci un'app di autenticazione all'SMS e proteggi prima di tutto la tua e-mail.",
    },
    passkeys: {
      title: "Usa le passkey quando puoi",
      text: "Una passkey sostituisce la password con una chiave salvata sul tuo dispositivo: impossibile da rubare con il phishing o da riutilizzare. Molti gestori le supportano.",
    },
    share: {
      title: "Non comunicare mai una password",
      text: "Nessun servizio serio te la chiede via e-mail, SMS o telefono. Nel dubbio, passa dal sito ufficiale.",
    },
  },
  checks: {
    manager: {
      label: "Uso un gestore di password",
    },
    "2fa-mail": {
      label: "L'autenticazione a due fattori è attiva sulla mia e-mail",
    },
    "screen-lock": {
      label: "Il mio schermo è bloccato (codice, impronta o volto)",
    },
    backup: {
      label: "I miei dati importanti hanno un backup",
    },
    updates: {
      label: "Il mio telefono e le mie app sono aggiornati",
    },
  },
  modal: {
    close: "Chiudi",
    eyebrow: "Igiene digitale",
    title: "Proteggere i tuoi account ogni giorno",
    intro: "Un buon punteggio di fiducia non basta: il modo in cui proteggi i tuoi accessi conta altrettanto. Bastano poche buone abitudini.",
    myScore: "Il mio bilancio · {done}/{total}",
    detectedInApps: "Rilevato nelle tue app",
    habits: "Le buone abitudini",
    managers: "Gestori consigliati",
    ecosystem: "Usi {name}, legato a un ecosistema. Un gestore indipendente ti permette di cambiare telefono o browser senza perdere tutto.",
    footer: "Link ufficiali (Play Store), senza affiliazione. Tutto quello che spunti qui resta sul tuo dispositivo.",
  },
};
