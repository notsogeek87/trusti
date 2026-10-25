/**
 * Reconnaît les apps du catalogue Trusti dans le texte lu (OCR) sur une
 * capture d'écran de la liste des apps d'un iPhone (Réglages → Apps).
 *
 * Utilisé uniquement par l'onboarding web : sur iPhone, aucune API ne permet
 * de lister les apps installées, alors on lit le texte de cette capture et on
 * compare chaque ligne aux noms des apps du catalogue.
 *
 * Les noms du catalogue viennent souvent du Play Store ("Spotify: Music and
 * Podcasts") alors que l'iPhone affiche le nom court ("Spotify") : on génère
 * donc plusieurs clés par app, de la plus sûre à la plus large.
 */

// Clés générées pour une app, par ordre de priorité (la plus basse gagne).
const PRIORITY = { FULL: 0, BASE: 1, NO_PUBLISHER: 2, FIRST_WORD: 3 };

// Préfixes d'éditeur que l'iPhone n'affiche pas ("Microsoft Word" → "Word",
// "Google Drive" → "Drive"). Proton, Infomaniak… gardent leur préfixe sur iOS.
const PUBLISHER_PREFIXES = ['microsoft', 'google'];

// Noms des apps intégrées d'iOS (FR + EN). Le catalogue contient des apps
// système Android aux mêmes noms ("Messages", "Contacts"…), qui ne sont PAS
// celles de l'iPhone : une ligne qui porte un de ces noms est ignorée, sauf
// si elle correspond à une vraie app Apple du catalogue (IOS_BUILTIN_ALIASES).
const IOS_BUILTIN_NAMES = [
  'messages', 'contacts', 'calendrier', 'calendar', 'fichiers', 'files', 'horloge', 'clock',
  'photos', 'gallery', 'maison', 'home', 'mail', 'notes', 'rappels', 'reminders', 'meteo',
  'weather', 'plans', 'maps', 'telephone', 'phone', 'appareil photo', 'camera', 'calculette',
  'calculator', 'dictaphone', 'voice memos', 'sante', 'health', 'livres', 'books', 'podcasts',
  'traduire', 'translate', 'boussole', 'compass', 'raccourcis', 'shortcuts', 'safari',
  'facetime', 'app store', 'reglages', 'settings', 'localiser', 'find my', 'bourse', 'stocks',
  'mesures', 'measure', 'tips', 'astuces', 'freeform', 'journal', 'invitations', 'passwords',
  'mots de passe', 'tv', 'apple tv', 'itunes store', 'forme', 'fitness', 'loupe', 'magnifier',
  'image playground', 'aperçu', 'apercu', 'preview', 'jeux', 'games', 'ecouter', 'clips',
];

// App intégrée d'iOS → nom exact de l'app Apple correspondante dans le catalogue.
const IOS_BUILTIN_ALIASES = {
  safari: 'Safari',
  mail: 'Mail',
  musique: 'Apple Music',
  music: 'Apple Music',
  wallet: 'Apple Pay',
};

const MIN_KEY_LENGTH = 2;
const MIN_FIRST_WORD_LENGTH = 4;
const MIN_FUZZY_LENGTH = 6;

/**
 * Minuscules, sans accents, sans ponctuation, espaces simples.
 * @param {string} text
 * @returns {string}
 */
export function normalizeAppName(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[​-‍﻿]/g, '')
    .replace(/[’'`]/g, '')
    .replace(/[^a-z0-9+]+/g, ' ')
    .trim();
}

const IOS_BUILTIN_SET = new Set(IOS_BUILTIN_NAMES.map(normalizeAppName));

// Partie du nom avant le sous-titre marketing : "TikTok - Videos" → "TikTok",
// "Spotify: Music" → "Spotify", "Organic Maps・Offline" → "Organic Maps".
function baseName(name) {
  return String(name || '').split(/\s[-–—|•]\s|:\s|・|\s\(|,|\.\s/)[0];
}

function keysForApp(app) {
  const keys = [];
  const full = normalizeAppName(app.name);
  const base = normalizeAppName(baseName(app.name));
  keys.push([full, PRIORITY.FULL]);
  keys.push([base, PRIORITY.BASE]);

  const words = base.split(' ');
  if (words.length > 1 && PUBLISHER_PREFIXES.includes(words[0])) {
    keys.push([words.slice(1).join(' '), PRIORITY.NO_PUBLISHER]);
  }
  if (words.length > 1 && words[0].length >= MIN_FIRST_WORD_LENGTH && !PUBLISHER_PREFIXES.includes(words[0])) {
    keys.push([words[0], PRIORITY.FIRST_WORD]);
  }
  return keys.filter(([key]) => key.length >= MIN_KEY_LENGTH);
}

/**
 * Index clé normalisée → app. Une clé partagée par plusieurs apps au même
 * niveau de priorité est ambiguë ("drive" : Google Drive et Proton Drive) et
 * n'est pas retenue.
 * @param {Array<{id: string|number, name: string}>} catalog
 * @returns {Map<string, {app: object, priority: number}>}
 */
export function buildAppIndex(catalog) {
  const candidates = new Map(); // clé -> { priority, apps: Map<id, app> }
  (catalog || []).forEach(app => {
    if (!app || !app.name) return;
    keysForApp(app).forEach(([key, priority]) => {
      const current = candidates.get(key);
      if (!current || priority < current.priority) {
        candidates.set(key, { priority, apps: new Map([[String(app.id), app]]) });
      } else if (priority === current.priority) {
        current.apps.set(String(app.id), app);
      }
    });
  });

  const index = new Map();
  candidates.forEach(({ priority, apps }, key) => {
    if (apps.size === 1) index.set(key, { app: [...apps.values()][0], priority });
  });
  return index;
}

function levenshtein(a, b) {
  if (a === b) return 0;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = curr;
  }
  return prev[b.length];
}

// Tolérance aux erreurs de lecture OCR ("WhatsApD"), proportionnelle à la
// longueur ; rien sous 6 lettres, où une lettre d'écart change d'app ("Drive" / "kDrive").
function maxDistance(length) {
  if (length < MIN_FUZZY_LENGTH) return 0;
  return length < 10 ? 1 : 2;
}

function matchLine(line, index) {
  const key = normalizeAppName(line);
  if (key.length < MIN_KEY_LENGTH) return null;

  const alias = Object.hasOwn(IOS_BUILTIN_ALIASES, key) && IOS_BUILTIN_ALIASES[key];
  if (alias) return index.get(normalizeAppName(alias))?.app || null;
  if (IOS_BUILTIN_SET.has(key)) return null;

  const exact = index.get(key);
  if (exact) return exact.app;

  // Pas de correspondance exacte : on tolère une petite erreur de lecture,
  // seulement sur les clés précises (pas sur les simples premiers mots).
  const tolerance = maxDistance(key.length);
  if (tolerance === 0) return null;
  let best = null;
  let bestDistance = Infinity;
  let tie = false;
  index.forEach(({ app, priority }, candidate) => {
    if (priority === PRIORITY.FIRST_WORD || candidate.length < MIN_FUZZY_LENGTH) return;
    if (candidate[0] !== key[0] || Math.abs(candidate.length - key.length) > tolerance) return;
    const distance = levenshtein(key, candidate);
    if (distance > tolerance) return;
    if (distance < bestDistance) {
      best = app;
      bestDistance = distance;
      tie = false;
    } else if (distance === bestDistance && String(app.id) !== String(best.id)) {
      tie = true;
    }
  });
  return tie ? null : best;
}

/**
 * Apps du catalogue reconnues dans le texte OCR (une app par ligne, dans
 * l'ordre d'apparition, sans doublon).
 * @param {string} ocrText texte brut lu sur une ou plusieurs captures
 * @param {Array<object>|Map<string, object>} catalogOrIndex catalogue ou index déjà construit
 * @returns {Array<object>}
 */
export function matchAppsFromText(ocrText, catalogOrIndex) {
  const index = catalogOrIndex instanceof Map ? catalogOrIndex : buildAppIndex(catalogOrIndex);
  const found = new Map();
  String(ocrText || '')
    .split(/\r?\n/)
    // Chevron ">" à droite de chaque ligne, puces ou icônes lues comme du texte
    .map(line => line.replace(/^[^\p{L}\p{N}#]+|[^\p{L}\p{N}+.!]+$/gu, '').trim())
    .forEach(line => {
      // L'icône à gauche du nom est parfois lue comme 1-2 caractères parasites ("@ WhatsApp", "Ss Gmail")
      const withoutIcon = line.replace(/^\S{1,2}\s+/, '');
      const app = matchLine(line, index) || (withoutIcon !== line ? matchLine(withoutIcon, index) : null);
      if (app && !found.has(String(app.id))) found.set(String(app.id), app);
    });
  return [...found.values()];
}
