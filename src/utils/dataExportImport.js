/**
 * Export / import des données locales Trusti (Réglages > Espace de stockage).
 * Pour l'instant, seules les notes par app sont concernées — le format est
 * volontairement extensible (clé "data" en objet) pour accueillir d'autres
 * données locales plus tard sans casser la compatibilité des fichiers déjà
 * exportés par les utilisateurs.
 */
import { getAllNotes } from './notesStorage';

const EXPORT_FORMAT = 'trusti-local-export';
const EXPORT_VERSION = 1;

/** Construit l'objet exporté (avant sérialisation JSON). */
export const buildExportData = () => ({
  format: EXPORT_FORMAT,
  version: EXPORT_VERSION,
  exportedAt: new Date().toISOString(),
  data: {
    notes: getAllNotes(),
  },
});

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
 * @returns {{ notesImported: number }} Résumé de ce qui a été importé.
 * @throws {Error} Si le fichier n'a pas le format attendu.
 */
export const importExportData = (parsed) => {
  if (!parsed || typeof parsed !== 'object' || parsed.format !== EXPORT_FORMAT) {
    throw new Error("Fichier invalide : ce n'est pas un export Trusti reconnu.");
  }
  const importedNotes = parsed.data?.notes;
  if (!importedNotes || typeof importedNotes !== 'object') {
    return { notesImported: 0 };
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
  return { notesImported: entries.length };
};

export default { buildExportData, buildExportFilename, importExportData };
