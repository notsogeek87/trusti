/**
 * Relations entre apps (alternatives / remplace) : liens saisis à la main
 * (table app_relations) et calcul complet via server/relations.js.
 */
import { computeRelations } from '../../relations.js';
import { sql } from './client.js';

/**
 * Ajouter des relations
 */
export async function addRelations(appId, relatedIds, relationType) {
  for (const relatedId of relatedIds) {
    try {
      // Ajouter la relation principale
      await sql`
        INSERT INTO app_relations (app_id, related_app_id, relation_type)
        VALUES (${appId}, ${relatedId}, ${relationType})
        ON CONFLICT (app_id, related_app_id, relation_type) DO NOTHING
      `;
      
      // Ajouter la relation inverse
      const inverseType = relationType === 'alternative' ? 'replaces' : 'alternative';
      await sql`
        INSERT INTO app_relations (app_id, related_app_id, relation_type)
        VALUES (${relatedId}, ${appId}, ${inverseType})
        ON CONFLICT (app_id, related_app_id, relation_type) DO NOTHING
      `;
    } catch (error) {
      console.error(`Error adding relation ${appId} -> ${relatedId}:`, error);
    }
  }
}

/**
 * Supprimer les relations d'une app (et leurs inverses)
 */
export async function deleteRelations(appId) {
  try {
    // Récupérer les relations existantes pour supprimer les inverses
    const existingRelations = await sql`
      SELECT related_app_id, relation_type
      FROM app_relations
      WHERE app_id = ${appId}
    `;
    
    // Supprimer les relations directes
    await sql`
      DELETE FROM app_relations
      WHERE app_id = ${appId}
    `;
    
    // Supprimer les relations inverses correspondantes
    for (const rel of existingRelations) {
      const inverseType = rel.relation_type === 'alternative' ? 'replaces' : 'alternative';
      await sql`
        DELETE FROM app_relations
        WHERE app_id = ${rel.related_app_id}
          AND related_app_id = ${appId}
          AND relation_type = ${inverseType}
      `;
    }
  } catch (error) {
    console.error('Error deleting relations:', error);
  }
}

/**
 * Relations d'une seule app (alternatives / remplace), même calcul que
 * buildRelationsMap : catégorie + liens saisis à la main (voir server/relations.js).
 */
export async function getAppRelations(appId) {
  try {
    const map = await buildRelationsMap();
    return map.get(String(appId)) || { alternativeAppIds: [], replacesAppIds: [] };
  } catch (error) {
    console.error('Error getting app relations:', error);
    return { alternativeAppIds: [], replacesAppIds: [] };
  }
}

/**
 * Construit en deux requêtes légères les relations (alternatives/remplace) de
 * TOUTES les applications : même catégorie mieux notée, plus les liens
 * « alternative » saisis à la main dans app_relations (autre catégorie
 * possible), toujours seulement vers une app strictement mieux notée.
 * Calcul en mémoire dans computeRelations (server/relations.js).
 *
 * @returns {Promise<Map<string, {alternativeAppIds: string[], replacesAppIds: string[]}>>}
 */
export async function buildRelationsMap() {
  const [rows, curated] = await Promise.all([
    sql`SELECT id, category, trusti_score FROM applications`,
    sql`SELECT app_id, related_app_id FROM app_relations WHERE relation_type = 'alternative'`,
  ]);
  return computeRelations(rows, curated);
}

export const EMPTY_RELATIONS = { alternativeAppIds: [], replacesAppIds: [] };
