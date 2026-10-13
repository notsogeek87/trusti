/**
 * Export / import des données locales Trusti (Réglages > Espace de stockage).
 * Sont concernées : les notes par app et la liste des apps « utilisées au
 * quotidien » (pour retrouver sa sélection en changeant de téléphone : les
 * apps installées se re-détectent par scan, pas la sélection du quotidien).
 * Le format est
 * volontairement extensible (clé "data" en objet) pour accueillir d'autres
 * données locales plus tard sans casser la compatibilité des fichiers déjà
 * exportés par les utilisateurs.
 */
import { getAllNotes } from './notesStorage.js';
import { parseLocalApps } from './localApps.js';

const EXPORT_FORMAT = 'trusti-local-export';
const EXPORT_VERSION = 1;

// Plafond défensif sur la liste importée : un fichier trafiqué ne doit pas
// pouvoir gonfler le stockage local ni l'URL de la requête de chargement.
const MAX_DAILY_APPS = 2000;

/**
 * Construit l'objet exporté (avant sérialisation JSON).
 *
 * @param {{ dailyApps?: Array<{id: string|number, name?: string}>,
 *           localApps?: Array<{id: string, name: string, packageName?: string}> }} [options]
 *   dailyApps : apps utilisées au quotidien (le nom est facultatif, purement
 *   informatif pour qui ouvre le fichier).
 *   localApps : apps « pas encore évaluées » ajoutées à la main (nom et
 *   package nécessaires pour les recréer sur un autre téléphone).
 */
export const buildExportData = ({ dailyApps = [], localApps = [] } = {}) => ({
  format: EXPORT_FORMAT,
  version: EXPORT_VERSION,
  exportedAt: new Date().toISOString(),
  data: {
    notes: getAllNotes(),
    dailyApps: dailyApps.map(({ id, name }) => (name ? { id: String(id), name } : { id: String(id) })),
    localApps: parseLocalApps(localApps),
  },
});

/**
 * Extrait les ids d'apps quotidiennes d'un export parsé (entrées invalides
 * ignorées, doublons retirés, ids toujours en chaînes).
 */
export const parseDailyAppIds = (parsed) => {
  const list = parsed?.data?.dailyApps;
  if (!Array.isArray(list)) return [];
  const ids = new Set();
  for (const entry of list) {
    const raw = entry && typeof entry === 'object' ? entry.id : entry;
    if (typeof raw !== 'string' && typeof raw !== 'number') continue;
    const id = String(raw).trim();
    if (/^[A-Za-z0-9_-]{1,64}$/.test(id)) ids.add(id);
    if (ids.size >= MAX_DAILY_APPS) break;
  }
  return Array.from(ids);
};

/** Nom de fichier suggéré pour l'export, horodaté. */
export const buildExportFilename = () => {
  const date = new Date().toISOString().slice(0, 10);
  return `trusti-export-${date}.json`;
};

/**
 * Valide et fusionne un export importé dans le localStorage courant.
 * Les notes importées écrasent les notes locales pour un même appId ; les
 * autres notes locales sont conservées.
 *
 * @param {unknown} parsed - Contenu JSON déjà parsé du fichier importé.
 * @returns {{ notesImported: number, dailyAppIds: string[], localApps: object[] }}
 *   Résumé de ce qui a été importé. Les apps du quotidien et les apps locales
 *   ne sont pas écrites ici (elles vivent dans l'état de l'app) : à
 *   l'appelant de les appliquer.
 * @throws {Error} Si le fichier n'a pas le format attendu.
 */
export const importExportData = (parsed) => {
  if (!parsed || typeof parsed !== 'object' || parsed.format !== EXPORT_FORMAT) {
    throw new Error("Fichier invalide : ce n'est pas un export Trusti reconnu.");
  }
  const dailyAppIds = parseDailyAppIds(parsed);
  const localApps = parseLocalApps(parsed.data?.localApps);
  const importedNotes = parsed.data?.notes;
  if (!importedNotes || typeof importedNotes !== 'object') {
    return { notesImported: 0, dailyAppIds, localApps };
  }

  const STORAGE_KEY = 'trusti_notes';
  let current = {};
  try {
    current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    current = {};
  }

  const entries = Object.entries(importedNotes).filter(
    ([, value]) => value && typeof value.text === 'string' && value.text.trim()
  );
  const merged = { ...current };
  entries.forEach(([appId, value]) => {
    merged[appId] = { text: value.text, updatedAt: value.updatedAt || new Date().toISOString() };
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return { notesImported: entries.length, dailyAppIds, localApps };
};

export default { buildExportData, buildExportFilename, importExportData, parseDailyAppIds };
