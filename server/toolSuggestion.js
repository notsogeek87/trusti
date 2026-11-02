/**
 * Validation des suggestions d'outils manquants (« Il manque un outil », page
 * ?organisation). Fonctions pures : testées dans tests/server/toolSuggestion.test.js.
 * Aucune donnée personnelle n'est demandée ni conservée (ni e-mail, ni IP).
 */

export const SUGGESTION_LIMITS = { nameMin: 2, nameMax: 80, websiteMax: 200, commentMax: 500 };

/** Supprime les caractères de contrôle et réduit les espaces. */
function clean(value) {
  return String(value ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Clé de regroupement : « Microsoft  Visio » et « microsoft visio » = même suggestion. */
export function suggestionKey(name) {
  return clean(name)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * @param {object} body corps JSON reçu
 * @returns {{ok: true, value: {nameKey: string, name: string, website: string|null, comment: string|null}} | {ok: false, error: string, silent?: boolean}}
 */
export function validateSuggestion(body) {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Requête invalide' };
  // Champ piège invisible : rempli seulement par les robots. On répond « ok » sans rien enregistrer.
  if (clean(body.company)) return { ok: false, error: 'spam', silent: true };

  const name = clean(body.name);
  if (name.length < SUGGESTION_LIMITS.nameMin || name.length > SUGGESTION_LIMITS.nameMax) {
    return { ok: false, error: `Le nom doit faire entre ${SUGGESTION_LIMITS.nameMin} et ${SUGGESTION_LIMITS.nameMax} caractères.` };
  }
  const nameKey = suggestionKey(name);
  if (nameKey.length < SUGGESTION_LIMITS.nameMin) return { ok: false, error: 'Nom d\'outil invalide.' };

  let website = clean(body.website) || null;
  if (website) {
    if (!/^https?:\/\//i.test(website)) website = `https://${website}`;
    let url;
    try {
      url = new URL(website);
    } catch {
      return { ok: false, error: 'Adresse du site invalide.' };
    }
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.') || website.length > SUGGESTION_LIMITS.websiteMax) {
      return { ok: false, error: 'Adresse du site invalide.' };
    }
    website = url.toString();
  }

  const comment = clean(body.comment).slice(0, SUGGESTION_LIMITS.commentMax) || null;
  return { ok: true, value: { nameKey, name, website, comment } };
}
