/**
 * Branchement de l'API partenaires /api/v1 sur la vraie base (voir router.js).
 */
import sql from '../database/sql.js';
import {
  listPublicApps, getPublicAppsByIds, getPublicCategories, getAllAssessments,
} from '../database/postgres/public-api.js';
import { getAssessmentForApp, getGradeHistoryForApp, getGradeChangesSince } from '../database/postgres/app-insights.js';
import { getAppRelations } from '../database/postgres/relations-store.js';
import { indexTranslations, applyAppTranslations, applyAssessmentTranslations, contentLanguages } from '../contentTranslations.js';
import { createPartnerResolver, partnerQueries } from './partners.js';
import { createPublicApiRouter } from './router.js';

/**
 * Superpose les traductions (langue demandée, puis anglais) aux lignes d'apps et aux évaluations, en une requête.
 * Sans langue, table absente ou erreur : tout reste en français.
 */
export async function translate(lang, { apps = [], assessments = [] }) {
  if (!lang || (apps.length === 0 && assessments.length === 0)) return { apps, assessments };
  try {
    const langs = contentLanguages(lang);
    const rows = await sql`
      SELECT entity, entity_id, field, lang, value, source_hash
      FROM content_translations
      WHERE lang = ANY(${langs}::text[])
        AND ((entity = 'application' AND entity_id = ANY(${apps.map(a => String(a.id))}::text[]))
          OR (entity = 'assessment' AND entity_id = ANY(${assessments.map(a => String(a.appId))}::text[])))`;
    const index = indexTranslations(rows, langs);
    if (index.size === 0) return { apps, assessments };
    return {
      apps: apps.map(a => applyAppTranslations(a, index)),
      assessments: assessments.map(a => applyAssessmentTranslations(a, index)),
    };
  } catch (error) {
    console.warn('[api v1] traductions ignorées :', error?.message);
    return { apps, assessments };
  }
}

export function createDefaultPublicApiRouter() {
  const queries = partnerQueries(sql);
  return createPublicApiRouter({
    resolvePartner: createPartnerResolver({ query: queries.query, touch: queries.touch, ttlMs: 60_000 }),
    db: {
      listApps: listPublicApps,
      getAppsByIds: getPublicAppsByIds,
      getCategories: getPublicCategories,
      getAllAssessments,
      getAssessment: getAssessmentForApp,
      getGradeHistory: getGradeHistoryForApp,
      getGradeChangesSince,
      getAlternativeIds: async (id) => (await getAppRelations(id)).alternativeAppIds,
      translate,
    },
  });
}
