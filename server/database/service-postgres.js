/**
 * Service de base de données PostgreSQL via Neon pour Vercel
 */
import { neon } from '@neondatabase/serverless';

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
 */
export async function getAllApps() {
  try {
    const apps = await sql`
      SELECT * FROM applications
      ORDER BY name ASC
    `;
    return Promise.all(apps.map(app => formatAppFromDB(app)));
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
 */
export async function getAppsByType(appType) {
  try {
    let apps;
    
    if (appType === 'trusti') {
      // Trusti Apps: scores A, B, C
      apps = await sql`
        SELECT * FROM applications
        WHERE trusti_score IN ('A', 'B', 'C')
        ORDER BY name ASC
      `;
    } else if (appType === 'star') {
      // Star Apps: scores D, E
      apps = await sql`
        SELECT * FROM applications
        WHERE trusti_score IN ('D', 'E')
        ORDER BY name ASC
      `;
    } else {
      // Autres types par appType stocké (pour compatibilité)
      apps = await sql`
        SELECT * FROM applications
        WHERE app_type = ${appType}
        ORDER BY name ASC
      `;
    }
    
    return Promise.all(apps.map(app => formatAppFromDB(app)));
  } catch (error) {
    console.error('Error getting apps by type:', error);
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
        is_open_source, is_european, jurisdiction, app_type, privacy_features
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
        ${JSON.stringify(appData.privacyFeatures || {})}
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
        privacy_features = COALESCE(${JSON.stringify(appData.privacyFeatures || {})}, privacy_features),
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
    const result = await sql`
      DELETE FROM applications
      WHERE id = ${id}
      RETURNING id
    `;
    
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
    let whereConditions = [];
    let params = [];
    
    // Filtre par nom
    if (query) {
      whereConditions.push(`name ILIKE $${params.length + 1}`);
      params.push(`%${query}%`);
    }
    
    // Filtre par catégorie
    if (filters.category) {
      whereConditions.push(`category = $${params.length + 1}`);
      params.push(filters.category);
    }
    
    // Filtre par score
    if (filters.score) {
      whereConditions.push(`trusti_score = $${params.length + 1}`);
      params.push(filters.score);
    }
    
    // Filtre par type
    if (filters.appType) {
      whereConditions.push(`app_type = $${params.length + 1}`);
      params.push(filters.appType);
    }
    
    // Filtre open-source
    if (filters.isOpenSource !== undefined) {
      whereConditions.push(`is_open_source = $${params.length + 1}`);
      params.push(filters.isOpenSource);
    }
    
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';
    
    const apps = await sql`
      SELECT * FROM applications
      ${sql.unsafe(whereClause)}
      ORDER BY name ASC
    `;
    
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
    const currentType = calculateAppType(currentScore);
    
    const alternativeAppIds = [];
    const replacesAppIds = [];
    
    // Si c'est une TrustiApp (A/B/C), elle remplace les StarApps (D/E) de même catégorie
    if (currentType === 'trusti') {
      const starApps = await sql`
        SELECT id 
        FROM applications 
        WHERE category = ${currentCategory}
        AND trusti_score IN ('D', 'E')
        AND id != ${appId}
      `;
      replacesAppIds.push(...starApps.map(app => app.id));
    }
    
    // Si c'est une StarApp (D/E), ses alternatives sont les TrustiApps (A/B/C) de même catégorie
    if (currentType === 'star') {
      const trustiApps = await sql`
        SELECT id 
        FROM applications 
        WHERE category = ${currentCategory}
        AND trusti_score IN ('A', 'B', 'C')
        AND id != ${appId}
      `;
      alternativeAppIds.push(...trustiApps.map(app => app.id));
    }
    
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
  
  return {
    id: app.id,
    name: app.name,
    trustiScore: trustiScore,
    grade: app.grade,
    category: app.category,
    icon: app.icon,
    color: app.color,
    reason: app.reason,
    playStoreUrl: app.play_store_url,
    appleStoreUrl: app.apple_store_url,
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
    privacyFeatures: typeof app.privacy_features === 'string' 
      ? JSON.parse(app.privacy_features) 
      : app.privacy_features,
    alternativeAppIds: relations.alternativeAppIds,
    replacesAppIds: relations.replacesAppIds,
    createdAt: app.created_at,
    updatedAt: app.updated_at
  };
}

export default {
  initDatabase,
  getAllApps,
  getAppsByType,
  getAppById,
  createApp,
  updateApp,
  deleteApp,
  searchApps,
  getStats
};
