/**
 * Utilitaires pour le partage de contenu
 */

/**
 * Partage du texte (et éventuellement un lien) via l'API native
 * ou copie dans le presse-papiers en fallback.
 *
 * @param {string} title - Titre du partage
 * @param {string} text - Texte lisible (fallback pour les canaux sans lien)
 * @param {string} [url] - Lien profond permettant de réimporter la sélection
 */
export const shareText = async (title, text, url) => {
  if (navigator.share) {
    try {
      await navigator.share(url ? { title, text, url } : { title, text });
    } catch (err) {
      // Partage annulé par l'utilisateur
    }
  } else {
    // Fallback presse-papiers : on ajoute le lien au texte s'il existe
    const payload = url ? `${text}\n\n${url}` : text;
    try {
      await navigator.clipboard.writeText(payload);
      alert('Copié dans le presse-papiers ✓');
    } catch (err) {
      console.error('Erreur lors de la copie', err);
    }
  }
};

/**
 * Copie du texte dans le presse-papiers
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    alert('Copié dans le presse-papiers ✓');
  } catch (err) {
    console.error('Erreur lors de la copie', err);
  }
};

/**
 * Construit un lien profond (deep link) partageable à partir de l'origine
 * courante. Le destinataire qui l'ouvre pourra réimporter la sélection.
 *
 * @param {Object} params
 * @param {Array<string|number>} [params.apps] - IDs des apps sélectionnées
 * @param {Array<{id: string|number, customAlt?: string}>} [params.migrations]
 *   - Migrations (app → alternative). `customAlt` est optionnel : sans lui,
 *     l'alternative par défaut de la base est utilisée côté destinataire.
 * @returns {string} URL absolue partageable
 */
export const buildShareUrl = ({ apps = [], migrations = [] } = {}) => {
  const base = `${window.location.origin}${window.location.pathname}`;
  const query = new URLSearchParams();

  if (apps.length > 0) {
    query.set('apps', apps.map(String).join(','));
  }

  if (migrations.length > 0) {
    // Chaque entrée : "id" ou "id~<nom encodé>" pour une alternative personnalisée
    const encoded = migrations.map(({ id, customAlt }) =>
      customAlt ? `${id}~${encodeURIComponent(customAlt)}` : String(id)
    );
    query.set('mig', encoded.join(','));
  }

  const qs = query.toString();
  return qs ? `${base}?${qs}` : base;
};

/**
 * Lit les paramètres de partage présents dans l'URL courante.
 *
 * @returns {{ appIds: string[], migrations: Array<{id: string, customAlt?: string}> }}
 *   Structure vide si aucun paramètre de partage n'est présent.
 */
export const parseShareParams = () => {
  const params = new URLSearchParams(window.location.search);
  const result = { appIds: [], migrations: [] };

  const appsParam = params.get('apps');
  if (appsParam) {
    result.appIds = appsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const migParam = params.get('mig');
  if (migParam) {
    result.migrations = migParam
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const sepIndex = entry.indexOf('~');
        if (sepIndex === -1) {
          return { id: entry };
        }
        const id = entry.slice(0, sepIndex);
        const customAlt = decodeURIComponent(entry.slice(sepIndex + 1));
        return { id, customAlt };
      })
      .filter(({ id }) => Boolean(id));
  }

  return result;
};

/**
 * Indique si l'URL courante contient des paramètres de partage à importer.
 */
export const hasShareParams = () => {
  const { appIds, migrations } = parseShareParams();
  return appIds.length > 0 || migrations.length > 0;
};

/**
 * Retire les paramètres de partage de l'URL sans recharger la page.
 */
export const clearShareParams = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete('apps');
  url.searchParams.delete('mig');
  window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
};
