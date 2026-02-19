/**
 * Service de base de données PostgreSQL via Neon pour Vercel
 */
import { neon } from '@neondatabase/serverless';
import gplay from 'google-play-scraper';

// Charger .env en développement local
if (process.env.NODE_ENV !== 'production') {
  try {
    const dotenv = await import('dotenv');
    dotenv.config();
  } catch (e) {
    // dotenv peut ne pas être installé en production
  }
}

// Initialiser la connexion Neon
const sql = neon(process.env.DATABASE_URL);

// Cache pour les icônes
const iconCache = {};

/**
 * Helper: Extraire le package ID depuis une URL Play Store
 */
function extractPackageId(playStoreUrl) {
  if (!playStoreUrl) return null;
  const match = playStoreUrl.match(/id=([a-zA-Z0-9._]+)/);
  return match ? match[1] : null;
}

/**
 * Helper: Vérifier si une URL d'image est valide
 */
async function isValidImageUrl(url) {
  try {
    const response = await fetch(url, { method: 'HEAD', timeout: 3000 });
    return response.ok && response.headers.get('content-type')?.startsWith('image/');
  } catch {
    return false;
  }
}

/**
 * Helper: Obtenir l'icône depuis F-Droid
 */
async function getFDroidIcon(packageName) {
  const patterns = [
    `https://f-droid.org/repo/icons-640/${packageName}.png`,
    `https://f-droid.org/repo/${packageName}/en-US/icon.png`,
    `https://f-droid.org/assets/${packageName}.png`
  ];

  for (const url of patterns) {
    if (await isValidImageUrl(url)) {
      return url;
    }
  }
  
  return null;
}

/**
 * Helper: Vérifier si l'app existe sur F-Droid et obtenir le lien
 */
async function getFDroidUrl(packageName) {
  if (!packageName) return null;
  
  try {
    const fdroidPageUrl = `https://f-droid.org/packages/${packageName}`;
    const response = await fetch(fdroidPageUrl, { method: 'HEAD', timeout: 3000 });
    
    if (response.ok) {
      return fdroidPageUrl;
    }
  } catch {
    // App pas sur F-Droid
  }
  
  return null;
}

/**
 * Helper: Récupérer l'icône dynamiquement (Play Store puis F-Droid)
 */
async function getAppIcon(playStoreUrl, currentIcon) {
  // Si pas de playStoreUrl, garder l'icône actuelle
  if (!playStoreUrl) return currentIcon;

  // Extraire le package ID
  const packageName = extractPackageId(playStoreUrl);
  if (!packageName) return currentIcon;

  // Vérifier le cache
  if (iconCache[packageName]) {
    return iconCache[packageName];
  }

  // 1. Essayer Play Store
  try {
    const appInfo = await gplay.app({ appId: packageName });
    if (appInfo && appInfo.icon) {
      iconCache[packageName] = appInfo.icon;
      return appInfo.icon;
    }
  } catch (error) {
    // App probablement pas sur Play Store
  }

  // 2. Essayer F-Droid
  try {
    const fdroidIcon = await getFDroidIcon(packageName);
    if (fdroidIcon) {
      iconCache[packageName] = fdroidIcon;
      return fdroidIcon;
    }
  } catch (error) {
    // App probablement pas sur F-Droid non plus
  }

  // 3. Garder l'icône actuelle
  return currentIcon;
}

/**
 * Helper: Récupérer les informations complètes depuis Play Store
 */
async function getPlayStoreInfo(playStoreUrl) {
  if (!playStoreUrl) return null;
  
  const packageName = extractPackageId(playStoreUrl);
  if (!packageName) return null;

  try {
    const appInfo = await gplay.app({ appId: packageName });
    return appInfo;
  } catch (error) {
    return null;
  }
}

/**
 * Helper: Construire l'URL Play Store depuis un package name
 */
function buildPlayStoreUrl(packageName) {
  if (!packageName) return null;
  return `https://play.google.com/store/apps/details?id=${packageName}`;
}

/**
 * Helper: Rechercher l'app sur l'App Store iTunes
 */
async function searchAppStore(appName) {
  if (!appName) return null;
  
  try {
    const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(appName)}&entity=software&limit=1`;
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].trackViewUrl;
    }
  } catch (error) {
    // Recherche échouée
  }
  
  return null;
}

/**
 * Créer les tables si elles n'existent pas
 */
export async function initDatabase() {
  try {
    // Table des applications
    await sql`
      CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        trusti_score TEXT NOT NULL,
        grade TEXT NOT NULL,
        category TEXT DEFAULT 'Application',
        icon TEXT,
        color TEXT DEFAULT 'bg-slate-600',
        reason TEXT DEFAULT '',
        play_store_url TEXT,
        apple_store_url TEXT,
        github_url TEXT,
        other_store_url TEXT,
        website TEXT,
        description TEXT,
        developer TEXT,
        license TEXT,
        is_open_source BOOLEAN DEFAULT FALSE,
        is_european BOOLEAN DEFAULT FALSE,
        jurisdiction TEXT,
        app_type TEXT DEFAULT 'regular',
        privacy_features JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Table des relations entre applications
    await sql`
      CREATE TABLE IF NOT EXISTS app_relations (
        id SERIAL PRIMARY KEY,
        app_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
        related_app_id TEXT NOT NULL,
        relation_type TEXT NOT NULL,
        UNIQUE(app_id, related_app_id, relation_type)
      )
    `;

    // Index pour améliorer les performances
    await sql`CREATE INDEX IF NOT EXISTS idx_app_type ON applications(app_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_trusti_score ON applications(trusti_score)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_app_relations_app_id ON app_relations(app_id)`;

    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

/**
 * Obtenir toutes les applications
 * @param {Object} options - Options de pagination
 * @param {number} options.limit - Nombre d'apps à retourner (0 = toutes)
 * @param {number} options.offset - Position de départ
 * @returns {Promise<{apps: Array, total: number}>} Apps et total
 */
export async function getAllApps(options = {}) {
  try {
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
    
    const formattedApps = await Promise.all(apps.map(app => formatAppFromDB(app)));
    
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
    const formattedApps = await Promise.all(apps.map(app => formatAppFromDB(app)));
    
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
 * Obtenir les applications pour les Awards (show_in_awards = 1)
 * @param {Object} options - Options de pagination
 * @param {number} options.limit - Nombre d'apps à retourner (0 = toutes)
 * @param {number} options.offset - Position de départ
 * @param {string} options.sortBy - Champ de tri (name, category, trusti_score)
 * @returns {Promise<{apps: Array, total: number}>} Apps et total
 */
export async function getAwardsApps(options = {}) {
  try {
    const { limit = 0, offset = 0, sortBy = 'category' } = options;
    
    console.log('🎯 getAwardsApps appelée avec:', { limit, offset, sortBy });
    
    // Obtenir le total d'apps Awards
    const totalResult = await sql`
      SELECT COUNT(*) as count FROM applications
      WHERE show_in_awards = 1
    `;
    const total = parseInt(totalResult[0].count);
    
    console.log(`📊 Total d'apps avec show_in_awards = 1: ${total}`);
    
    // Obtenir les apps avec pagination et tri
    let apps;
    
    if (sortBy === 'name') {
      if (limit > 0) {
        apps = await sql`
          SELECT * FROM applications
          WHERE show_in_awards = 1
          ORDER BY name ASC
          LIMIT ${limit}
          OFFSET ${offset}
        `;
      } else {
        apps = await sql`
          SELECT * FROM applications
          WHERE show_in_awards = 1
          ORDER BY name ASC
        `;
      }
    } else if (sortBy === 'trusti_score') {
      if (limit > 0) {
        apps = await sql`
          SELECT * FROM applications
          WHERE show_in_awards = 1
          ORDER BY trusti_score ASC, name ASC
          LIMIT ${limit}
          OFFSET ${offset}
        `;
      } else {
        apps = await sql`
          SELECT * FROM applications
          WHERE show_in_awards = 1
          ORDER BY trusti_score ASC, name ASC
        `;
      }
    } else {
      // Tri par défaut: catégorie puis nom
      if (limit > 0) {
        apps = await sql`
          SELECT * FROM applications
          WHERE show_in_awards = 1
          ORDER BY category ASC, name ASC
          LIMIT ${limit}
          OFFSET ${offset}
        `;
      } else {
        apps = await sql`
          SELECT * FROM applications
          WHERE show_in_awards = 1
          ORDER BY category ASC, name ASC
        `;
      }
    }
    
    const formattedApps = await Promise.all(apps.map(app => formatAppFromDB(app)));
    
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
    return await formatAppFromDB(apps[0]);
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
    
    const formattedApps = await Promise.all(apps.map(app => formatAppFromDB(app)));
    
    return formattedApps;
  } catch (error) {
    console.error('Error getting apps by ids:', error);
    throw error;
  }
}

/**
 * Créer une nouvelle application
 */
export async function createApp(appData) {
  try {
    const id = appData.id || String(Date.now());
    const trustiScore = appData.trustiScore || appData.grade || 'C';
    const grade = appData.grade || appData.trustiScore || 'C';
    
    const apps = await sql`
      INSERT INTO applications (
        id, name, trusti_score, grade, category, icon, color, reason,
        play_store_url, apple_store_url, github_url, other_store_url,
        website, description, developer, license,
        is_open_source, is_european, jurisdiction, app_type, show_in_awards, popularity, privacy_features, permissions
      )
      VALUES (
        ${id}, ${appData.name}, ${trustiScore}, ${grade},
        ${appData.category || 'Application'}, ${appData.icon || null},
        ${appData.color || 'bg-slate-600'}, ${appData.reason || ''},
        ${appData.playStoreUrl || null}, ${appData.appleStoreUrl || null},
        ${appData.githubUrl || null}, ${appData.otherStoreUrl || null},
        ${appData.website || null}, ${appData.description || null},
        ${appData.developer || null}, ${appData.license || null},
        ${appData.isOpenSource || false}, ${appData.isEuropean || false},
        ${appData.jurisdiction || null}, ${appData.appType || 'regular'},
        ${appData.show_in_awards !== undefined ? Number(appData.show_in_awards) : (appData.showInAwards !== false ? 1 : 0)},
        ${appData.popularity !== undefined ? appData.popularity : 9999},
        ${JSON.stringify(appData.privacyFeatures || {})},
        ${JSON.stringify(appData.permissions || [])}
      )
      RETURNING *
    `;
    
    // Ajouter les relations
    if (appData.alternativeAppIds && appData.alternativeAppIds.length > 0) {
      await addRelations(id, appData.alternativeAppIds, 'alternative');
    }
    if (appData.replacesAppIds && appData.replacesAppIds.length > 0) {
      await addRelations(id, appData.replacesAppIds, 'replaces');
    }
    
    return await formatAppFromDB(apps[0]);
  } catch (error) {
    console.error('Error creating app:', error);
    throw error;
  }
}

/**
 * Mettre à jour une application
 */
export async function updateApp(id, appData) {
  try {
    const trustiScore = appData.trustiScore || appData.grade;
    const grade = appData.grade || appData.trustiScore;
    
    const apps = await sql`
      UPDATE applications SET
        name = COALESCE(${appData.name}, name),
        trusti_score = COALESCE(${trustiScore}, trusti_score),
        grade = COALESCE(${grade}, grade),
        category = COALESCE(${appData.category}, category),
        icon = COALESCE(${appData.icon}, icon),
        color = COALESCE(${appData.color}, color),
        reason = COALESCE(${appData.reason}, reason),
        play_store_url = COALESCE(${appData.playStoreUrl}, play_store_url),
        apple_store_url = COALESCE(${appData.appleStoreUrl}, apple_store_url),
        github_url = COALESCE(${appData.githubUrl}, github_url),
        other_store_url = COALESCE(${appData.otherStoreUrl}, other_store_url),
        website = COALESCE(${appData.website}, website),
        description = COALESCE(${appData.description}, description),
        developer = COALESCE(${appData.developer}, developer),
        license = COALESCE(${appData.license}, license),
        is_open_source = COALESCE(${appData.isOpenSource}, is_open_source),
        is_european = COALESCE(${appData.isEuropean}, is_european),
        jurisdiction = COALESCE(${appData.jurisdiction}, jurisdiction),
        app_type = COALESCE(${appData.appType}, app_type),
        show_in_awards = COALESCE(${
          appData.show_in_awards !== undefined ? Number(appData.show_in_awards) : 
          (appData.showInAwards !== undefined ? (appData.showInAwards ? 1 : 0) : null)
        }, show_in_awards),
        popularity = COALESCE(${appData.popularity !== undefined ? appData.popularity : null}, popularity),
        privacy_features = COALESCE(${JSON.stringify(appData.privacyFeatures || {})}, privacy_features),
        permissions = COALESCE(${JSON.stringify(appData.permissions || [])}, permissions),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (apps.length === 0) return null;
    
    // Mettre à jour les relations
    await deleteRelations(id);
    if (appData.alternativeAppIds && appData.alternativeAppIds.length > 0) {
      await addRelations(id, appData.alternativeAppIds, 'alternative');
    }
    if (appData.replacesAppIds && appData.replacesAppIds.length > 0) {
      await addRelations(id, appData.replacesAppIds, 'replaces');
    }
    
    return await formatAppFromDB(apps[0]);
  } catch (error) {
    console.error('Error updating app:', error);
    throw error;
  }
}

/**
 * Supprimer une application
 */
export async function deleteApp(id) {
  try {
    // S'assurer que l'ID est une string pour la comparaison avec TEXT
    const idString = String(id);
    console.log('🗑️ Attempting to delete app with ID:', idString, 'original type:', typeof id);
    
    const result = await sql`
      DELETE FROM applications
      WHERE id = ${idString}
      RETURNING id
    `;
    
    console.log('🗑️ Delete result:', result.length > 0 ? 'Success' : 'Not found', 'rows affected:', result.length);
    
    if (result.length > 0) {
      // Supprimer aussi les relations
      await sql`DELETE FROM app_relations WHERE app_id = ${idString} OR related_app_id = ${idString}`;
    }
    
    return result.length > 0;
  } catch (error) {
    console.error('Error deleting app:', error);
    throw error;
  }
}

/**
 * Rechercher des applications
 */
export async function searchApps(query, filters = {}) {
  try {
    let apps;
    
    // Recherche simple par nom (cas le plus courant)
    if (query && Object.keys(filters).length === 0) {
      const searchPattern = `%${query}%`;
      apps = await sql`
        SELECT * FROM applications
        WHERE name ILIKE ${searchPattern}
        ORDER BY trusti_score ASC, name ASC
      `;
    } 
    // Recherche avec filtres additionnels
    else if (query && filters.category) {
      const searchPattern = `%${query}%`;
      apps = await sql`
        SELECT * FROM applications
        WHERE name ILIKE ${searchPattern} AND category = ${filters.category}
        ORDER BY trusti_score ASC, name ASC
      `;
    }
    else if (query && filters.score) {
      const searchPattern = `%${query}%`;
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
    
    return Promise.all(apps.map(app => formatAppFromDB(app)));
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

// ============================================================================
// Fonctions utilitaires
// ============================================================================

/**
 * Ajouter des relations
 */
async function addRelations(appId, relatedIds, relationType) {
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
async function deleteRelations(appId) {
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
 * Obtenir les relations d'une app
 */
/**
 * Obtenir les relations automatiques d'une application basées sur la catégorie et le trustiScore
 * - TrustiApps (A/B/C) remplacent les StarApps (D/E) de même catégorie
 * - StarApps (D/E) ont comme alternatives les TrustiApps (A/B/C) de même catégorie
 */
async function getAppRelations(appId) {
  try {
    // Récupérer l'app courante pour connaître sa catégorie et son trustiScore
    const apps = await sql`
      SELECT trusti_score, category 
      FROM applications 
      WHERE id = ${appId}
    `;
    
    if (apps.length === 0) {
      return { alternativeAppIds: [], replacesAppIds: [] };
    }
    
    const currentApp = apps[0];
    const currentScore = currentApp.trusti_score;
    const currentCategory = currentApp.category;
    
    // Ordre des scores (A est meilleur que E)
    const scoreOrder = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 };
    const currentScoreValue = scoreOrder[currentScore] || 999;
    
    const alternativeAppIds = [];
    const replacesAppIds = [];
    
    // 1. Récupérer toutes les apps de la même catégorie
    const sameCategory = await sql`
      SELECT id, trusti_score 
      FROM applications 
      WHERE category = ${currentCategory}
      AND id != ${appId}
    `;
    
    // 2. Séparer en alternatives (meilleurs scores) et remplace (pires scores)
    sameCategory.forEach(app => {
      const appScoreValue = scoreOrder[app.trusti_score] || 999;
      
      // Alternative = score meilleur (valeur plus petite)
      if (appScoreValue < currentScoreValue) {
        alternativeAppIds.push(String(app.id));
      }
      
      // Remplace = score pire (valeur plus grande)
      if (appScoreValue > currentScoreValue) {
        replacesAppIds.push(String(app.id));
      }
    });
    
    return { alternativeAppIds, replacesAppIds };
  } catch (error) {
    console.error('Error getting app relations:', error);
    return { alternativeAppIds: [], replacesAppIds: [] };
  }
}

/**
 * Calculer le type d'application basé sur le trustiScore
 * @param {string} trustiScore - Score A, B, C, D ou E
 * @returns {string} 'trusti' (A/B/C), 'star' (D/E), ou 'regular'
 */
function calculateAppType(trustiScore) {
  if (['A', 'B', 'C'].includes(trustiScore)) return 'trusti';
  if (['D', 'E'].includes(trustiScore)) return 'star';
  return 'regular';
}

/**
 * Formater une application depuis la DB
 */
async function formatAppFromDB(app) {
  const trustiScore = app.trusti_score;
  const appType = app.app_type || calculateAppType(trustiScore);
  
  // Charger les relations
  const relations = await getAppRelations(app.id);
  
  // Récupérer l'icône dynamiquement depuis Play Store / F-Droid
  let icon = await getAppIcon(app.play_store_url, app.icon);
  
  // Récupérer les infos depuis Play Store si disponible
  let playStoreUrl = app.play_store_url;
  let appleStoreUrl = app.apple_store_url;
  let fDroidUrl = null;
  
  const packageName = extractPackageId(playStoreUrl);
  
  if (playStoreUrl) {
    if (packageName && !playStoreUrl.startsWith('https://play.google.com')) {
      // Construire une URL Play Store valide si nécessaire
      playStoreUrl = buildPlayStoreUrl(packageName);
    }
  }
  
  // Si pas d'URL App Store, essayer de la trouver automatiquement
  // Exception : ne pas chercher pour les apps F-Droid uniquement (com.github.*, etc.)
  const isFDroidOnly = packageName && (
    packageName.startsWith('com.github.') || 
    packageName.startsWith('org.fdroid.') ||
    packageName.startsWith('io.github.')
  );
  
  if (!appleStoreUrl && app.name && !isFDroidOnly) {
    appleStoreUrl = await searchAppStore(app.name);
  }
  
  // Pour les TrustiApps (A/B/C), vérifier si l'app existe sur F-Droid
  if (appType === 'trusti' && packageName) {
    fDroidUrl = await getFDroidUrl(packageName);
  }
  
  // Récupérer les permissions depuis la base de données
  let permissions = typeof app.permissions === 'string' 
    ? JSON.parse(app.permissions) 
    : (Array.isArray(app.permissions) ? app.permissions : []);
  
  return {
    id: app.id,
    name: app.name,
    trustiScore: trustiScore,
    grade: app.grade,
    category: app.category,
    icon: icon, // Icône récupérée dynamiquement
    color: app.color,
    reason: app.reason,
    playStoreUrl: playStoreUrl, // URL Play Store vérifiée/construite
    appleStoreUrl: appleStoreUrl, // URL App Store (existante ou recherchée)
    fDroidUrl: fDroidUrl, // URL F-Droid (uniquement pour TrustiApps A/B/C)
    githubUrl: app.github_url,
    otherStoreUrl: app.other_store_url,
    website: app.website,
    description: app.description,
    developer: app.developer,
    license: app.license,
    isOpenSource: app.is_open_source,
    isEuropean: app.is_european,
    jurisdiction: app.jurisdiction,
    appType: appType,
    showInAwards: app.show_in_awards !== 0,
    popularity: app.popularity ?? 9999,
    privacyFeatures: typeof app.privacy_features === 'string' 
      ? JSON.parse(app.privacy_features) 
      : app.privacy_features,
    alternativeAppIds: relations.alternativeAppIds,
    replacesAppIds: relations.replacesAppIds,
    permissions: permissions, // Permissions Android récupérées depuis Play Store
    createdAt: app.created_at,
    updatedAt: app.updated_at
  };
}

export default {
  initDatabase,
  getAllApps,
  getAppsByType,
  getAwardsApps,
  getAppById,
  getAppsByIds,
  createApp,
  updateApp,
  deleteApp,
  searchApps,
  getStats
};
