/**
 * Lecture des apps : catalogue paginé, palmarès, onboarding, apps pro,
 * recherche, statistiques.
 */
import { onboardingSubcategoryParents } from '../../onboardingCategories.js';
import { sql } from './client.js';
import { escapeLike, formatAppFromDB } from './app-format.js';
import { EMPTY_RELATIONS, buildRelationsMap, getAppRelations } from './relations-store.js';

/**
 * Obtenir toutes les applications
 * @param {Object} options - Options de pagination
 * @param {number} options.limit - Nombre d'apps à retourner (0 = toutes)
 * @param {number} options.offset - Position de départ
 * @returns {Promise<{apps: Array, total: number}>} Apps et total
 */
export async function getAllApps(options = {}) {
  try {
    // Lancée en parallèle des requêtes principales (plutôt qu'à la suite)
    const relationsPromise = buildRelationsMap();
    relationsPromise.catch(() => {}); // évite un rejet non géré si une requête précédente échoue
    const { limit = 0, offset = 0, sortBy = 'trusti_score' } = options;
    
    // Obtenir le total d'apps
    const totalResult = await sql`
      SELECT COUNT(*) as count FROM applications
    `;
    const total = parseInt(totalResult[0].count);
    
    // Obtenir les apps avec pagination et tri
    let apps;
    
    if (sortBy === 'popularity') {
      // Tri par popularité
      if (limit > 0) {
        apps = await sql`
          SELECT * FROM applications
          ORDER BY popularity ASC, name ASC
          LIMIT ${limit}
          OFFSET ${offset}
        `;
      } else {
        apps = await sql`
          SELECT * FROM applications
          ORDER BY popularity ASC, name ASC
        `;
      }
    } else if (sortBy === 'name') {
      // Tri par nom
      if (limit > 0) {
        apps = await sql`
          SELECT * FROM applications
          ORDER BY name ASC
          LIMIT ${limit}
          OFFSET ${offset}
        `;
      } else {
        apps = await sql`
          SELECT * FROM applications
          ORDER BY name ASC
        `;
      }
    } else if (sortBy === 'grade') {
      // Tri par grade (A > B > C > D > E) puis par nom — même ordre que l'affichage
      // du catalogue côté client, pour que la pagination n'entraîne pas de
      // réordonnancement (et donc de "saut") des cartes déjà affichées.
      if (limit > 0) {
        apps = await sql`
          SELECT * FROM applications
          ORDER BY grade ASC, name ASC
          LIMIT ${limit}
          OFFSET ${offset}
        `;
      } else {
        apps = await sql`
          SELECT * FROM applications
          ORDER BY grade ASC, name ASC
        `;
      }
    } else {
      // Tri par défaut: trusti_score
      if (limit > 0) {
        apps = await sql`
          SELECT * FROM applications
          ORDER BY trusti_score ASC, name ASC
          LIMIT ${limit}
          OFFSET ${offset}
        `;
      } else {
        apps = await sql`
          SELECT * FROM applications
          ORDER BY trusti_score ASC, name ASC
        `;
      }
    }
    
    const relationsMap = await relationsPromise;
    const formattedApps = apps.map(app => formatAppFromDB(app, relationsMap.get(String(app.id)) || EMPTY_RELATIONS));
    
    return {
      apps: formattedApps,
      total,
      limit,
      offset
    };
  } catch (error) {
    console.error('Error getting all apps:', error);
    throw error;
  }
}

/**
 * Obtenir les applications par type
 * Type déterminé par le trustiScore:
 * - 'trusti': scores A, B, C
 * - 'star': scores D, E
 * @param {string} appType - Type d'apps à récupérer
 * @param {Object} options - Options de pagination
 * @param {number} options.limit - Nombre d'apps à retourner (0 = toutes)
 * @param {number} options.offset - Position de départ
 * @returns {Promise<{apps: Array, total: number}>} Apps et total
 */
export async function getAppsByType(appType, options = {}) {
  try {
    // Lancée en parallèle des requêtes principales (plutôt qu'à la suite)
    const relationsPromise = buildRelationsMap();
    relationsPromise.catch(() => {}); // évite un rejet non géré si une requête précédente échoue
    const { limit = 0, offset = 0 } = options;
    let apps;
    let totalResult;
    
    if (appType === 'trusti') {
      // Trusti Apps: scores A, B, C
      totalResult = await sql`
        SELECT COUNT(*) as count FROM applications
        WHERE trusti_score IN ('A', 'B', 'C')
      `;
      
      if (limit > 0) {
        apps = await sql`
          SELECT * FROM applications
          WHERE trusti_score IN ('A', 'B', 'C')
          ORDER BY trusti_score ASC, name ASC
          LIMIT ${limit}
          OFFSET ${offset}
        `;
      } else {
        apps = await sql`
          SELECT * FROM applications
          WHERE trusti_score IN ('A', 'B', 'C')
          ORDER BY trusti_score ASC, name ASC
        `;
      }
    } else if (appType === 'star') {
      // Star Apps: scores D, E
      totalResult = await sql`
        SELECT COUNT(*) as count FROM applications
        WHERE trusti_score IN ('D', 'E')
      `;
      
      if (limit > 0) {
        apps = await sql`
          SELECT * FROM applications
          WHERE trusti_score IN ('D', 'E')
          ORDER BY trusti_score ASC, name ASC
          LIMIT ${limit}
          OFFSET ${offset}
        `;
      } else {
        apps = await sql`
          SELECT * FROM applications
          WHERE trusti_score IN ('D', 'E')
          ORDER BY trusti_score ASC, name ASC
        `;
      }
    } else {
      // Autres types par appType stocké (pour compatibilité)
      totalResult = await sql`
        SELECT COUNT(*) as count FROM applications
        WHERE app_type = ${appType}
      `;
      
      if (limit > 0) {
        apps = await sql`
          SELECT * FROM applications
          WHERE app_type = ${appType}
          ORDER BY trusti_score ASC, name ASC
          LIMIT ${limit}
          OFFSET ${offset}
        `;
      } else {
        apps = await sql`
          SELECT * FROM applications
          WHERE app_type = ${appType}
          ORDER BY trusti_score ASC, name ASC
        `;
      }
    }
    
    const total = parseInt(totalResult[0].count);
    const relationsMap = await relationsPromise;
    const formattedApps = apps.map(app => formatAppFromDB(app, relationsMap.get(String(app.id)) || EMPTY_RELATIONS));
    
    return {
      apps: formattedApps,
      total,
      limit,
      offset
    };
  } catch (error) {
    console.error('Error getting apps by type:', error);
    throw error;
  }
}

/**
 * Obtenir les applications pour l'onboarding (show_in_onboarding = 1)
 */
export async function getOnboardingApps(options = {}) {
  try {
    // Lancée en parallèle des requêtes principales (plutôt qu'à la suite)
    const relationsPromise = buildRelationsMap();
    relationsPromise.catch(() => {}); // évite un rejet non géré si une requête précédente échoue
    const { limit = 0, offset = 0, categories = [] } = options;

    let apps;
    let total;

    if (categories.length > 0) {
      // Filtre par catégories (pour le lazy loading par étape). Les sous-catégories
      // « Parent / … » des catégories découpées suivent leur parent (voir onboardingCategories.js).
      const parents = onboardingSubcategoryParents(categories);
      const countResult = await sql`
        SELECT COUNT(*) as count FROM applications
        WHERE COALESCE(show_in_onboarding, 1) = 1
          AND (category = ANY(${categories})
               OR (position(' / ' in category) > 0 AND split_part(category, ' / ', 1) = ANY(${parents})))
      `;
      total = parseInt(countResult[0].count);

      apps = limit > 0
        ? await sql`
            SELECT * FROM applications
            WHERE COALESCE(show_in_onboarding, 1) = 1
              AND (category = ANY(${categories})
                   OR (position(' / ' in category) > 0 AND split_part(category, ' / ', 1) = ANY(${parents})))
            ORDER BY popularity ASC, name ASC
            LIMIT ${limit} OFFSET ${offset}
          `
        : await sql`
            SELECT * FROM applications
            WHERE COALESCE(show_in_onboarding, 1) = 1
              AND (category = ANY(${categories})
                   OR (position(' / ' in category) > 0 AND split_part(category, ' / ', 1) = ANY(${parents})))
            ORDER BY popularity ASC, name ASC
          `;
    } else {
      const countResult = await sql`
        SELECT COUNT(*) as count FROM applications WHERE COALESCE(show_in_onboarding, 1) = 1
      `;
      total = parseInt(countResult[0].count);

      apps = limit > 0
        ? await sql`
            SELECT * FROM applications
            WHERE COALESCE(show_in_onboarding, 1) = 1
            ORDER BY popularity ASC, name ASC
            LIMIT ${limit} OFFSET ${offset}
          `
        : await sql`
            SELECT * FROM applications
            WHERE COALESCE(show_in_onboarding, 1) = 1
            ORDER BY popularity ASC, name ASC
          `;
    }

    const relationsMap = await relationsPromise;
    const formatted = apps.map(app => formatAppFromDB(app, relationsMap.get(String(app.id)) || EMPTY_RELATIONS));
    return { apps: formatted, total, limit, offset };
  } catch (error) {
    console.error('Error getting onboarding apps:', error);
    throw error;
  }
}

/**
 * Apps marquées « usage pro » (colonne usage_pro), pour l'évaluation du parc
 * applicatif d'une organisation (page « ?organisation »). Lecture seule.
 * Même format que les autres listes (formatAppFromDB) ; la colonne usage_pro
 * n'est pas ajoutée au format commun pour ne rien changer aux autres réponses.
 * @returns {Promise<{apps: Array, total: number}>}
 */
export async function getProApps() {
  try {
    const relationsPromise = buildRelationsMap();
    relationsPromise.catch(() => {});
    const [apps, curated] = await Promise.all([
      sql`
        SELECT * FROM applications
        WHERE usage_pro = TRUE
        ORDER BY category ASC, popularity ASC, name ASC
      `,
      // Alternatives choisies une par une (table app_relations), proposées en
      // priorité dans le plan d'action ; propre à cette réponse.
      sql`SELECT app_id, related_app_id FROM app_relations WHERE relation_type = 'alternative'`,
    ]);
    const curatedMap = new Map();
    for (const row of curated) {
      const key = String(row.app_id);
      if (!curatedMap.has(key)) curatedMap.set(key, []);
      curatedMap.get(key).push(String(row.related_app_id));
    }
    const relationsMap = await relationsPromise;
    const formatted = apps.map(app => ({
      ...formatAppFromDB(app, relationsMap.get(String(app.id)) || EMPTY_RELATIONS),
      curatedAlternativeIds: curatedMap.get(String(app.id)) || [],
    }));
    return { apps: formatted, total: formatted.length };
  } catch (error) {
    console.error('Error getting pro apps:', error);
    throw error;
  }
}

/**
 * Obtenir les applications du Palmarès : show_in_awards = 1 ET TrustiScore A ou B
 * (filet de sécurité : une app mal notée ne peut pas être recommandée)
 * @param {Object} options - Options de pagination
 * @param {number} options.limit - Nombre d'apps à retourner (0 = toutes)
 * @param {number} options.offset - Position de départ
 * @param {string} options.sortBy - Champ de tri (name, category, trusti_score)
 * @returns {Promise<{apps: Array, total: number}>} Apps et total
 */
export async function getAwardsApps(options = {}) {
  try {
    // Lancée en parallèle des requêtes principales (plutôt qu'à la suite)
    const relationsPromise = buildRelationsMap();
    relationsPromise.catch(() => {}); // évite un rejet non géré si une requête précédente échoue
    const { limit = 0, offset = 0, sortBy = 'category' } = options;
    
    console.log('🎯 getAwardsApps appelée avec:', { limit, offset, sortBy });
    
    // Obtenir le total d'apps Awards
    const totalResult = await sql`
      SELECT COUNT(*) as count FROM applications
      WHERE show_in_awards = 1 AND trusti_score IN ('A', 'B')
    `;
    const total = parseInt(totalResult[0].count);
    
    console.log(`📊 Total d'apps avec show_in_awards = 1: ${total}`);
    
    // Obtenir les apps avec pagination et tri
    let apps;
    
    if (sortBy === 'name') {
      if (limit > 0) {
        apps = await sql`
          SELECT * FROM applications
          WHERE show_in_awards = 1 AND trusti_score IN ('A', 'B')
          ORDER BY name ASC
          LIMIT ${limit}
          OFFSET ${offset}
        `;
      } else {
        apps = await sql`
          SELECT * FROM applications
          WHERE show_in_awards = 1 AND trusti_score IN ('A', 'B')
          ORDER BY name ASC
        `;
      }
    } else if (sortBy === 'trusti_score') {
      if (limit > 0) {
        apps = await sql`
          SELECT * FROM applications
          WHERE show_in_awards = 1 AND trusti_score IN ('A', 'B')
          ORDER BY trusti_score ASC, name ASC
          LIMIT ${limit}
          OFFSET ${offset}
        `;
      } else {
        apps = await sql`
          SELECT * FROM applications
          WHERE show_in_awards = 1 AND trusti_score IN ('A', 'B')
          ORDER BY trusti_score ASC, name ASC
        `;
      }
    } else {
      // Tri par défaut: catégorie puis nom
      if (limit > 0) {
        apps = await sql`
          SELECT * FROM applications
          WHERE show_in_awards = 1 AND trusti_score IN ('A', 'B')
          ORDER BY category ASC, name ASC
          LIMIT ${limit}
          OFFSET ${offset}
        `;
      } else {
        apps = await sql`
          SELECT * FROM applications
          WHERE show_in_awards = 1 AND trusti_score IN ('A', 'B')
          ORDER BY category ASC, name ASC
        `;
      }
    }
    
    const relationsMap = await relationsPromise;
    const formattedApps = apps.map(app => formatAppFromDB(app, relationsMap.get(String(app.id)) || EMPTY_RELATIONS));
    
    return {
      apps: formattedApps,
      total,
      limit,
      offset
    };
  } catch (error) {
    console.error('Error getting awards apps:', error);
    throw error;
  }
}

/**
 * Obtenir une application par ID
 */
export async function getAppById(id) {
  try {
    const apps = await sql`
      SELECT * FROM applications
      WHERE id = ${id}
      LIMIT 1
    `;
    
    if (apps.length === 0) return null;
    const relations = await getAppRelations(apps[0].id);
    return formatAppFromDB(apps[0], relations);
  } catch (error) {
    console.error('Error getting app by id:', error);
    throw error;
  }
}

/**
 * Obtenir plusieurs applications par leurs IDs
 * @param {Array<string>} ids - Tableau d'IDs d'applications
 * @returns {Promise<Array>} Apps correspondant aux IDs fournis
 */
export async function getAppsByIds(ids) {
  try {
    if (!ids || ids.length === 0) {
      return [];
    }

    // Lancée en parallèle des requêtes principales (plutôt qu'à la suite)
    const relationsPromise = buildRelationsMap();
    relationsPromise.catch(() => {}); // évite un rejet non géré si une requête précédente échoue
    
    console.log('🔍 getAppsByIds appelée avec:', ids.length, 'IDs');
    
    // Normaliser les IDs en strings
    const normalizedIds = ids.map(id => String(id));
    
    // Utiliser IN pour récupérer toutes les apps en une seule requête
    const apps = await sql`
      SELECT * FROM applications
      WHERE id = ANY(${normalizedIds})
      ORDER BY name ASC
    `;
    
    console.log(`✅ ${apps.length} apps trouvées sur ${ids.length} IDs demandés`);
    
    const relationsMap = await relationsPromise;
    const formattedApps = apps.map(app => formatAppFromDB(app, relationsMap.get(String(app.id)) || EMPTY_RELATIONS));
    
    return formattedApps;
  } catch (error) {
    console.error('Error getting apps by ids:', error);
    throw error;
  }
}

/**
 * Rechercher des applications
 */
export async function searchApps(query, filters = {}) {
  try {
    // Lancée en parallèle des requêtes principales (plutôt qu'à la suite)
    const relationsPromise = buildRelationsMap();
    relationsPromise.catch(() => {}); // évite un rejet non géré si une requête précédente échoue
    let apps;
    
    // Recherche simple par nom (cas le plus courant)
    if (query && Object.keys(filters).length === 0) {
      const searchPattern = `%${escapeLike(query)}%`;
      apps = await sql`
        SELECT * FROM applications
        WHERE name ILIKE ${searchPattern}
        ORDER BY trusti_score ASC, name ASC
      `;
    } 
    // Recherche avec filtres additionnels
    else if (query && filters.category) {
      const searchPattern = `%${escapeLike(query)}%`;
      apps = await sql`
        SELECT * FROM applications
        WHERE name ILIKE ${searchPattern} AND category = ${filters.category}
        ORDER BY trusti_score ASC, name ASC
      `;
    }
    else if (query && filters.score) {
      const searchPattern = `%${escapeLike(query)}%`;
      apps = await sql`
        SELECT * FROM applications
        WHERE name ILIKE ${searchPattern} AND trusti_score = ${filters.score}
        ORDER BY trusti_score ASC, name ASC
      `;
    }
    else if (filters.category && !query) {
      apps = await sql`
        SELECT * FROM applications
        WHERE category = ${filters.category}
        ORDER BY trusti_score ASC, name ASC
      `;
    }
    else if (filters.score && !query) {
      apps = await sql`
        SELECT * FROM applications
        WHERE trusti_score = ${filters.score}
        ORDER BY trusti_score ASC, name ASC
      `;
    }
    // Pas de filtre du tout - retourner toutes les apps
    else {
      apps = await sql`
        SELECT * FROM applications
        ORDER BY trusti_score ASC, name ASC
      `;
    }
    
    const relationsMap = await relationsPromise;
    return apps.map(app => formatAppFromDB(app, relationsMap.get(String(app.id)) || EMPTY_RELATIONS));
  } catch (error) {
    console.error('Error searching apps:', error);
    throw error;
  }
}

/**
 * Obtenir les statistiques
 */
export async function getStats() {
  try {
    const byType = await sql`
      SELECT app_type, COUNT(*) as count
      FROM applications
      GROUP BY app_type
    `;
    
    const byScore = await sql`
      SELECT trusti_score, COUNT(*) as count
      FROM applications
      GROUP BY trusti_score
      ORDER BY trusti_score ASC
    `;
    
    const byCategory = await sql`
      SELECT category, COUNT(*) as count
      FROM applications
      GROUP BY category
      ORDER BY count DESC
      LIMIT 10
    `;
    
    const total = await sql`SELECT COUNT(*) as count FROM applications`;
    
    return {
      total: parseInt(total[0].count),
      byType: byType.map(row => ({ appType: row.app_type, count: parseInt(row.count) })),
      byScore: byScore.map(row => ({ trustiScore: row.trusti_score, count: parseInt(row.count) })),
      byCategory: byCategory.map(row => ({ category: row.category, count: parseInt(row.count) }))
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    throw error;
  }
}

/**
 * Obtenir les applications filtrées par note (grade)
 * @param {string|string[]} grades - Une note ou un tableau de notes (ex: 'A' ou ['A','B'])
 * @param {Object} options - Options de pagination
 */
export async function getAppsByGrade(grades, options = {}) {
  try {
    // Lancée en parallèle des requêtes principales (plutôt qu'à la suite)
    const relationsPromise = buildRelationsMap();
    relationsPromise.catch(() => {}); // évite un rejet non géré si une requête précédente échoue
    const { limit = 0, offset = 0 } = options;
    const gradesArray = Array.isArray(grades) ? grades : [grades];

    const totalResult = await sql`
      SELECT COUNT(*) as count FROM applications
      WHERE trusti_score = ANY(${gradesArray})
    `;
    const total = parseInt(totalResult[0].count);

    let apps;
    if (limit > 0) {
      apps = await sql`
        SELECT * FROM applications
        WHERE trusti_score = ANY(${gradesArray})
        ORDER BY trusti_score ASC, name ASC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    } else {
      apps = await sql`
        SELECT * FROM applications
        WHERE trusti_score = ANY(${gradesArray})
        ORDER BY trusti_score ASC, name ASC
      `;
    }

    const relationsMap = await relationsPromise;
    const formattedApps = apps.map(app => formatAppFromDB(app, relationsMap.get(String(app.id)) || EMPTY_RELATIONS));
    return { apps: formattedApps, total, limit, offset };
  } catch (error) {
    console.error('Error getting apps by grade:', error);
    throw error;
  }
}

/**
 * Obtenir les applications alternatives pour une app donnée
 * (apps de même catégorie ou liées à la main, avec une meilleure note)
 * @param {string} appId - ID de l'application
 * @returns {Promise<Array>} Liste des alternatives complètes
 */
export async function getAlternativesForApp(appId) {
  try {
    const { alternativeAppIds } = await getAppRelations(appId);
    if (!alternativeAppIds || alternativeAppIds.length === 0) {
      return [];
    }
    return await getAppsByIds(alternativeAppIds);
  } catch (error) {
    console.error('Error getting alternatives for app:', error);
    throw error;
  }
}
