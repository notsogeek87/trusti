export default {
  managers: {
    bitwarden: {
      pitch: "Open source, synchronisé sur tous tes appareils, gratuit pour l'essentiel.",
    },
    keepassdx: {
      pitch: "100 % local, sans compte : tes mots de passe restent dans un fichier que tu contrôles.",
    },
    "proton-pass": {
      pitch: "Chiffré de bout en bout, éditeur suisse, intégré à l'écosystème Proton.",
    },
  },
  practices: {
    unique: {
      title: "Un mot de passe différent par compte",
      text: "Si un site se fait pirater, les voleurs essaient le même mot de passe ailleurs. Un mot de passe unique limite les dégâts à un seul compte.",
    },
    long: {
      title: "Long plutôt que compliqué",
      text: "Une phrase de passe de 4 mots au hasard ou plus (ou 16 caractères et plus) résiste mieux qu'un mot court plein de symboles.",
    },
    manager: {
      title: "Un gestionnaire plutôt que ta mémoire",
      text: "Un gestionnaire génère et retient des mots de passe uniques à ta place. Tu n'as plus à retenir qu'un seul mot de passe maître, long et solide.",
    },
    "2fa": {
      title: "Active la double authentification (2FA)",
      text: "Un code temporaire en plus du mot de passe bloque la plupart des piratages. Préfère une application d'authentification au SMS, et protège d'abord ta messagerie.",
    },
    passkeys: {
      title: "Adopte les passkeys quand c'est possible",
      text: "Une passkey remplace le mot de passe par une clé stockée sur ton appareil : impossible à hameçonner ou à réutiliser. Beaucoup de gestionnaires savent les gérer.",
    },
    share: {
      title: "Ne communique jamais un mot de passe",
      text: "Aucun service sérieux ne te le demande par e-mail, SMS ou téléphone. En cas de doute, passe par le site officiel.",
    },
  },
  checks: {
    manager: {
      label: "J'utilise un gestionnaire de mots de passe",
    },
    "2fa-mail": {
      label: "La double authentification est active sur ma messagerie",
    },
    "screen-lock": {
      label: "Mon écran est verrouillé (code, empreinte ou visage)",
    },
    backup: {
      label: "Mes données importantes sont sauvegardées",
    },
    updates: {
      label: "Mon téléphone et mes apps sont à jour",
    },
  },
  modal: {
    close: "Fermer",
    eyebrow: "Hygiène numérique",
    title: "Protéger vos comptes au quotidien",
    intro: "Un bon score de confiance ne suffit pas : la façon dont vous protégez vos accès compte autant. Quelques réflexes suffisent.",
    myScore: "Mon bilan · {done}/{total}",
    detectedInApps: "Détecté dans tes apps",
    habits: "Les bons réflexes",
    managers: "Gestionnaires conseillés",
    ecosystem: "Tu utilises {name}, lié à un écosystème. Un gestionnaire indépendant te laisse changer de téléphone ou de navigateur sans tout perdre.",
    footer: "Liens officiels (Play Store), sans affiliation. Tout ce que tu coches ici reste sur ton appareil.",
  },
};
