/**
 * Guides de migration par app (table `app_migration_guides`) : mise en forme pour l'API.
 * Une ligne par app et par sens : `export` (récupérer ses données de l'app quittée) et
 * `import` (les faire entrer dans l'alternative). Les textes vivent en base pour être
 * corrigés sans republier l'APK (voir docs/guides/migration-guidee.md).
 *
 * Fonctions pures, sans accès base : testables seules (tests/server/migrationGuides.test.js).
 */

const asList = (value) => (Array.isArray(value) ? value.filter(v => typeof v === 'string' && v.trim()) : []);

/** Ligne de la table -> section prête à afficher. */
export function formatGuideSection(row) {
  if (!row) return null;
  return {
    summary: row.summary || null,
    steps: asList(row.steps),
    notes: asList(row.notes),
    source: row.source_url || null,
    checkedAt: row.checked_at ? String(row.checked_at).slice(0, 10) : null,
    verified: Boolean(row.verified),
  };
}

/**
 * Guide de transfert pour une migration `fromId` -> `toId`. Si l'alternative importe
 * directement depuis l'app quittée (`direct_from`), l'export se résume à `direct_export`.
 *
 * @param {Array<object>} rows lignes de app_migration_guides pour fromId et toId
 * @returns {{ export: object|null, import: object|null }} null quand aucun guide n'existe
 */
export function buildTransferGuide(rows, fromId, toId) {
  const from = String(fromId ?? '');
  const to = String(toId ?? '');
  const exportRow = (rows || []).find(r => r && String(r.app_id) === from && r.direction === 'export');
  const importRow = (rows || []).find(r => r && String(r.app_id) === to && r.direction === 'import');
  const direct = importRow && asList(importRow.direct_from).includes(from) && importRow.direct_export;

  return {
    export: direct
      ? { summary: importRow.direct_export, steps: [], notes: [], source: null, checkedAt: null, verified: Boolean(importRow.verified) }
      : formatGuideSection(exportRow),
    import: formatGuideSection(importRow),
  };
}
