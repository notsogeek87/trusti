import { DetectionStatus, ProtectionLevel } from '../../technical';

/**
 * Niveaux de lecture pédagogique pour un FAIT technique précis (ex. "mode
 * debug actif"). Chaque signal porte sur un seul fait, jamais sur
 * l'application dans son ensemble : il n'y a toujours aucun verdict global
 * "application sûre / pas sûre" ici — seulement des repères visuels et un
 * texte en langage clair pour un public non technique, en complément (jamais
 * en remplacement) du détail factuel affiché dans les cartes ci-dessous. Voir
 * docs/architecture/technical-analysis.md.
 */
export const SignalLevel = Object.freeze({
  GOOD: 'good',
  WATCH: 'watch',
  ALERT: 'alert',
  NEUTRAL: 'neutral',
});

export const SIGNAL_STYLE = {
  [SignalLevel.GOOD]: {
    icon: '✅',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  [SignalLevel.WATCH]: {
    icon: '⚠️',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  [SignalLevel.ALERT]: {
    icon: '🚨',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    dotClass: 'bg-red-500',
  },
  [SignalLevel.NEUTRAL]: {
    icon: 'ℹ️',
    badgeClass: 'bg-slate-50 text-slate-500 border-slate-200',
    dotClass: 'bg-slate-300',
  },
};

// Repère indicatif (pas une règle Android officielle) pour situer l'âge du
// SDK ciblé aux yeux d'un public non technique. Volontairement prudent —
// à ajuster périodiquement à mesure que les versions d'Android avancent.
const TARGET_SDK_GOOD_FLOOR = 33; // Android 13
const TARGET_SDK_WATCH_FLOOR = 29; // Android 10

function targetSdkSignal(version) {
  if (version == null) {
    return { level: SignalLevel.NEUTRAL, explanation: "Version d'Android ciblée non déterminée." };
  }
  if (version >= TARGET_SDK_GOOD_FLOOR) {
    return {
      level: SignalLevel.GOOD,
      explanation: `Cible une version récente d'Android (API ${version}) : l'application est censée respecter les protections de sécurité et de vie privée les plus à jour.`,
    };
  }
  if (version >= TARGET_SDK_WATCH_FLOOR) {
    return {
      level: SignalLevel.WATCH,
      explanation: `Cible une version d'Android un peu ancienne (API ${version}) : certaines protections plus récentes peuvent ne pas s'appliquer.`,
    };
  }
  return {
    level: SignalLevel.ALERT,
    explanation: `Cible une version ancienne d'Android (API ${version}) : l'application peut se passer de plusieurs protections de sécurité et de vie privée introduites depuis.`,
  };
}

/**
 * Signaux de sécurité pédagogiques construits à partir d'un SecurityInfo.
 * Ne couvre que les faits où le sens « favorable / à surveiller » est établi
 * par des bonnes pratiques Android documentées (mode debug, cleartext,
 * backup, SDK ciblé). Les faits réellement ambigus (composants exportés,
 * signataires multiples, schéma de signature...) restent volontairement
 * neutres : on ne peut pas en déduire un « bon » ou un « mauvais » sans
 * connaître le contexte de l'application.
 */
export function getSecuritySignals(security) {
  return [
    {
      key: 'debuggable',
      label: 'Mode debug (debuggable)',
      value: security.debuggable,
      ...(security.debuggable === DetectionStatus.DETECTED
        ? {
            level: SignalLevel.ALERT,
            explanation:
              "Le mode debug est actif. Sur un appareil non protégé, il peut permettre d'inspecter ou de modifier l'application en cours d'exécution — il ne devrait normalement pas être activé sur une version publiée.",
          }
        : security.debuggable === DetectionStatus.NOT_DETECTED
        ? { level: SignalLevel.GOOD, explanation: "Le mode debug est désactivé, comme attendu pour une application publiée." }
        : { level: SignalLevel.NEUTRAL, explanation: 'Statut du mode debug non déterminé.' }),
    },
    {
      key: 'cleartext',
      label: 'Trafic HTTP non chiffré autorisé',
      value: security.usesCleartextTraffic,
      ...(security.usesCleartextTraffic === DetectionStatus.DETECTED
        ? {
            level: SignalLevel.ALERT,
            explanation:
              "L'application autorise des échanges réseau non chiffrés (HTTP). Des données pourraient alors circuler en clair, lisibles par un tiers présent sur le même réseau (ex. Wi-Fi public).",
          }
        : security.usesCleartextTraffic === DetectionStatus.NOT_DETECTED
        ? {
            level: SignalLevel.GOOD,
            explanation: "Le trafic non chiffré n'est pas autorisé par défaut : les échanges réseau déclarés passent par une connexion chiffrée (HTTPS).",
          }
        : { level: SignalLevel.NEUTRAL, explanation: "Ce paramètre n'a pas pu être déterminé." }),
    },
    {
      key: 'backup',
      label: 'Sauvegarde Android (backup)',
      value: security.allowBackup,
      ...(security.allowBackup === DetectionStatus.DETECTED
        ? {
            level: SignalLevel.WATCH,
            explanation:
              "Les données de l'application peuvent être incluses dans une sauvegarde/restauration Android (par ex. lors d'un changement de téléphone), ce qui élargit un peu leur surface d'exposition.",
          }
        : security.allowBackup === DetectionStatus.NOT_DETECTED
        ? { level: SignalLevel.GOOD, explanation: "La sauvegarde automatique des données de l'application est désactivée." }
        : { level: SignalLevel.NEUTRAL, explanation: "Ce paramètre n'a pas pu être déterminé." }),
    },
    {
      key: 'targetSdk',
      label: 'Version Android ciblée',
      value: security.targetSdkVersion,
      ...targetSdkSignal(security.targetSdkVersion),
    },
  ];
}

/**
 * Signal agrégé sur les permissions "sensibles" (DANGEROUS) effectivement
 * accordées. Une permission sensible accordée n'est pas en soi un problème
 * (l'utilisateur l'a confirmée), mais plus il y en a, plus ça mérite un coup
 * d'œil — d'où un niveau "watch"/"alert" plutôt qu'un simple compteur neutre.
 */
export function getPermissionSignal(permissions) {
  const sensitiveGranted = permissions.filter(
    (p) => p.protectionLevel === ProtectionLevel.DANGEROUS && p.granted === DetectionStatus.DETECTED
  );
  const n = sensitiveGranted.length;
  if (n === 0) {
    return {
      level: SignalLevel.GOOD,
      label: 'Permissions sensibles',
      explanation: 'Aucune permission sensible accordée détectée.',
      count: 0,
    };
  }
  return {
    level: n >= 4 ? SignalLevel.ALERT : SignalLevel.WATCH,
    label: 'Permissions sensibles',
    explanation: `${n} permission${n > 1 ? 's' : ''} sensible${n > 1 ? 's' : ''} accordée${n > 1 ? 's' : ''} (ex. caméra, localisation, contacts...) — chacune a nécessité votre confirmation explicite lors de l'installation ou d'un usage.`,
    count: n,
  };
}

/** Signal agrégé sur le nombre de trackers connus détectés. */
export function getTrackerSignal(trackers) {
  const n = trackers.length;
  if (n === 0) {
    return { level: SignalLevel.GOOD, label: 'Trackers', explanation: 'Aucun tracker connu détecté.', count: 0 };
  }
  return {
    level: n >= 3 ? SignalLevel.ALERT : SignalLevel.WATCH,
    label: 'Trackers',
    explanation: `${n} tracker${n > 1 ? 's' : ''} connu${n > 1 ? 's' : ''} détecté${n > 1 ? 's' : ''} — des bibliothèques généralement utilisées pour la publicité, la mesure d'audience ou l'attribution.`,
    count: n,
  };
}

/**
 * Vue d'ensemble utilisée tout en haut de la section et dans le badge de
 * l'accordéon : uniquement les signaux qui méritent l'attention (watch /
 * alert), triés du plus au moins préoccupant. Vide = rien à signaler parmi
 * les points vérifiés, pas "application sans risque".
 */
export function getOverviewSignals(analysis) {
  const all = [
    ...getSecuritySignals(analysis.security),
    { ...getPermissionSignal(analysis.permissions), key: 'permissions' },
    { ...getTrackerSignal(analysis.trackers), key: 'trackers' },
  ];
  const order = { [SignalLevel.ALERT]: 0, [SignalLevel.WATCH]: 1, [SignalLevel.GOOD]: 2, [SignalLevel.NEUTRAL]: 3 };
  return all
    .filter((s) => s.level === SignalLevel.ALERT || s.level === SignalLevel.WATCH)
    .sort((a, b) => order[a.level] - order[b.level]);
}

export function countSignalsByLevel(analysis) {
  const overview = getOverviewSignals(analysis);
  return {
    alert: overview.filter((s) => s.level === SignalLevel.ALERT).length,
    watch: overview.filter((s) => s.level === SignalLevel.WATCH).length,
  };
}
