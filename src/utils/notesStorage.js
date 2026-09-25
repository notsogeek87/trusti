/**
 * Notes personnelles par app, saisies librement par l'utilisateur.
 * Stockées uniquement en localStorage (clé "trusti_notes", préfixe commun
 * voir storageStats.js) — jamais envoyées au serveur / à la base de données.
 */
const STORAGE_KEY = 'trusti_notes';

const readAll = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeAll = (notes) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // localStorage indisponible (navigation privée stricte) : note perdue.
  }
};

/** Récupère la note d'une app (chaîne vide si aucune). */
export const getNote = (appId) => {
  if (!appId) return '';
  const notes = readAll();
  return notes[String(appId)]?.text || '';
};

/** Enregistre (ou efface si texte vide) la note d'une app. */
export const setNote = (appId, text) => {
  if (!appId) return;
  const notes = readAll();
  const trimmed = (text || '').trim();
  const key = String(appId);
  if (!trimmed) {
    delete notes[key];
  } else {
    notes[key] = { text, updatedAt: new Date().toISOString() };
  }
  writeAll(notes);
};

/** Toutes les notes, telles que stockées : { [appId]: { text, updatedAt } }. */
export const getAllNotes = () => readAll();

/** Nombre de notes renseignées, pour affichage (ex. page Stockage). */
export const getNotesCount = () => Object.keys(readAll()).length;

export default { getNote, setNote, getAllNotes, getNotesCount };
