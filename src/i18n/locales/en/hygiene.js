export default {
  managers: {
    bitwarden: {
      pitch: "Open source, synced across all your devices, free for the essentials.",
    },
    keepassdx: {
      pitch: "100% local, no account: your passwords stay in a file you control.",
    },
    "proton-pass": {
      pitch: "End-to-end encrypted, Swiss provider, part of the Proton ecosystem.",
    },
  },
  practices: {
    unique: {
      title: "A different password for each account",
      text: "If a site gets hacked, thieves try the same password elsewhere. A unique password limits the damage to a single account.",
    },
    long: {
      title: "Long rather than complicated",
      text: "A passphrase of 4 or more random words (or 16 characters or more) holds up better than a short word full of symbols.",
    },
    manager: {
      title: "A manager rather than your memory",
      text: "A manager creates and remembers unique passwords for you. You only have to remember one long, strong master password.",
    },
    "2fa": {
      title: "Turn on two-factor authentication (2FA)",
      text: "A temporary code on top of the password blocks most hacks. Prefer an authenticator app to SMS, and protect your email first.",
    },
    passkeys: {
      title: "Use passkeys whenever you can",
      text: "A passkey replaces the password with a key stored on your device: it can't be phished or reused. Many managers can handle them.",
    },
    share: {
      title: "Never give out a password",
      text: "No serious service will ask you for it by email, SMS or phone. If in doubt, go through the official website.",
    },
  },
  checks: {
    manager: {
      label: "I use a password manager",
    },
    "2fa-mail": {
      label: "Two-factor authentication is on for my email",
    },
    "screen-lock": {
      label: "My screen is locked (PIN, fingerprint or face)",
    },
    backup: {
      label: "My important data is backed up",
    },
    updates: {
      label: "My phone and apps are up to date",
    },
  },
  modal: {
    close: "Close",
    eyebrow: "Digital hygiene",
    title: "Protecting your accounts day to day",
    intro: "A good trust score isn't enough: how you protect your logins matters just as much. A few habits are all it takes.",
    myScore: "My score · {done}/{total}",
    detectedInApps: "Detected in your apps",
    habits: "Good habits",
    managers: "Recommended managers",
    ecosystem: "You use {name}, which is tied to an ecosystem. An independent manager lets you switch phone or browser without losing everything.",
    footer: "Official links (Play Store), no affiliation. Everything you tick here stays on your device.",
  },
};
