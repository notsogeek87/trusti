/**
 * Sauvegarde locale de l'évaluation « organisation » (sélection, criticités,
 * profil et nom de l'organisation pour le rapport). Rien n'est envoyé au
 * serveur. Le stockage peut être indisponible (navigation privée, données
 * bloquées) : chaque accès est protégé et la page fonctionne sans.
 */
const STORAGE_KEY = 'trusti_organisation_v1';

export function loadOrganisationState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!Array.isArray(data?.ids)) return null;
    return {
      ids: data.ids.map(String),
      criticality: data.criticality && typeof data.criticality === 'object' ? data.criticality : {},
      profile: typeof data.profile === 'string' ? data.profile : null,
      orgName: typeof data.orgName === 'string' ? data.orgName : '',
    };
  } catch {
    return null;
  }
}

export function saveOrganisationState(ids, criticality, extra = {}) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ids,
      criticality,
      profile: extra.profile || null,
      orgName: extra.orgName || '',
      savedAt: new Date().toISOString(),
    }));
  } catch {
    // stockage indisponible : la sélection reste en mémoire pour la session
  }
}

export function clearOrganisationState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // rien à faire
  }
}
