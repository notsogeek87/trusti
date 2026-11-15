/**
 * Traduction de l'interface (FR, EN, DE). Voir docs/guides/traduction.md.
 *
 * - `t('ns.cle', { nom: 'x' })` : texte dans la langue courante, variables `{nom}`.
 *   Pluriel : `t('ns.cle', { count: n })` choisit `cle_one` / `cle_other` (Intl.PluralRules).
 * - Utilisable partout (composants, hooks, utilitaires, PDF) : pas de contexte React.
 * - La langue est fixée au démarrage (`initI18n`, appelé par main.jsx avant de charger
 *   l'app). Changer de langue recharge l'app : pas de rendu à moitié traduit.
 * - Le français est embarqué ; l'anglais et l'allemand sont chargés à la demande.
 * - Une clé absente d'une traduction retombe sur le français.
 * - Seules les langues de `ENABLED_LANGUAGES` sont proposées : une langue n'y entre que
 *   complète (tests/technical/i18n.test.js le vérifie).
 */
import fr from './locales/fr/index.js';
import { ENABLED_LANGUAGES, LANGUAGES, DEFAULT_LANGUAGE } from './languages.js';

export { ENABLED_LANGUAGES, LANGUAGES, DEFAULT_LANGUAGE };

const STORAGE_KEY = 'trusti-lang';
const LOCALES = { fr: 'fr-FR', en: 'en-GB', de: 'de-DE' };
const LOADERS = {
  en: () => import('./locales/en/index.js'),
  de: () => import('./locales/de/index.js'),
};

let currentLang = DEFAULT_LANGUAGE;
let messages = fr;

const isEnabled = (lang) => ENABLED_LANGUAGES.includes(lang);

function readStored() {
  try { return globalThis.localStorage?.getItem(STORAGE_KEY) || null; } catch { return null; }
}

function writeStored(lang) {
  try { globalThis.localStorage?.setItem(STORAGE_KEY, lang); } catch { /* navigation privée */ }
}

/**
 * Langue à utiliser : `?lang=` dans l'adresse (liens depuis le site), puis le choix
 * mémorisé, puis la langue du navigateur ou du téléphone, sinon le français.
 */
export function detectLanguage({ search = globalThis.location?.search || '', navigatorLanguages } = {}) {
  const fromUrl = new URLSearchParams(search).get('lang');
  if (fromUrl && isEnabled(fromUrl)) return { lang: fromUrl, fromUrl: true };
  const stored = readStored();
  if (stored && isEnabled(stored)) return { lang: stored, fromUrl: false };
  const nav = navigatorLanguages
    || (globalThis.navigator?.languages?.length ? globalThis.navigator.languages : [globalThis.navigator?.language || '']);
  for (const l of nav) {
    const short = String(l || '').slice(0, 2).toLowerCase();
    if (isEnabled(short)) return { lang: short, fromUrl: false };
  }
  return { lang: DEFAULT_LANGUAGE, fromUrl: false };
}

/** Charge et active une langue (le français est toujours disponible). */
export async function setLanguageMessages(lang) {
  if (lang === DEFAULT_LANGUAGE || !LOADERS[lang]) {
    currentLang = DEFAULT_LANGUAGE;
    messages = fr;
    return;
  }
  const mod = await LOADERS[lang]();
  currentLang = lang;
  messages = mod.default;
}

/** À appeler une fois au démarrage, avant d'importer l'app. */
export async function initI18n() {
  const { lang, fromUrl } = detectLanguage();
  try {
    await setLanguageMessages(lang);
  } catch (err) {
    console.warn(`Traduction ${lang} indisponible, affichage en français :`, err);
    await setLanguageMessages(DEFAULT_LANGUAGE);
  }
  if (fromUrl) writeStored(currentLang);
  if (globalThis.document?.documentElement) globalThis.document.documentElement.lang = currentLang;
  return currentLang;
}

/** Change de langue : mémorise le choix et recharge l'app. */
export function changeLanguage(lang) {
  if (!isEnabled(lang)) return;
  writeStored(lang);
  const url = new URL(globalThis.location.href);
  url.searchParams.delete('lang');
  globalThis.location.replace(url.toString());
}

export const getLanguage = () => currentLang;
/** Locale pour Intl (dates, nombres) : fr-FR, en-GB, de-DE. */
export const getLocale = () => LOCALES[currentLang] || LOCALES.fr;

function lookup(dict, key) {
  let node = dict;
  for (const part of key.split('.')) {
    if (node == null || typeof node !== 'object') return undefined;
    node = node[part];
  }
  return node;
}

function interpolate(text, vars) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (m, name) => (name in vars && vars[name] != null ? String(vars[name]) : m));
}

/**
 * Texte traduit. Une valeur non textuelle (tableau, objet) est renvoyée telle quelle :
 * utile pour des listes (`t('ns.etapes')`).
 */
export function t(key, vars) {
  let k = key;
  if (vars && typeof vars.count === 'number') {
    const form = new Intl.PluralRules(getLocale()).select(vars.count);
    const plural = `${key}_${form}`;
    if (lookup(messages, plural) !== undefined || lookup(fr, plural) !== undefined) k = plural;
    else if (lookup(messages, `${key}_other`) !== undefined || lookup(fr, `${key}_other`) !== undefined) k = `${key}_other`;
  }
  let value = lookup(messages, k);
  if (value === undefined && messages !== fr) value = lookup(fr, k);
  if (value === undefined) {
    if (globalThis.process?.env?.NODE_ENV !== 'production') console.warn(`[i18n] clé manquante : ${k}`);
    return key;
  }
  return typeof value === 'string' ? interpolate(value, vars) : value;
}

/** Date au format de la langue courante. */
export function formatDate(date, options) {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(getLocale(), options).format(d);
}

/** Nombre au format de la langue courante. */
export function formatNumber(n, options) {
  return new Intl.NumberFormat(getLocale(), options).format(n);
}
