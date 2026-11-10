/**
 * Écriture des apps (création, mise à jour, suppression).
 */
import { sql } from './client.js';
import { formatAppFromDB } from './app-format.js';
import { addRelations, deleteRelations, getAppRelations } from './relations-store.js';
import { enrichFromPlayStore } from './store-enrichment.js';

/**
 * Créer une nouvelle application
 */
export async function createApp(appData) {
  try {
    appData = await enrichFromPlayStore(appData);
    const id = appData.id || String(Date.now());
    const trustiScore = appData.trustiScore || appData.grade || 'C';
    const grade = appData.grade || appData.trustiScore || 'C';
    
    const apps = await sql`
      INSERT INTO applications (
        id, name, trusti_score, grade, category, icon, color, reason,
        play_store_url, apple_store_url, f_droid_url, github_url, other_store_url,
        website, description, developer, license,
        is_open_source, is_european, jurisdiction, app_type, show_in_awards, show_in_onboarding, popularity, privacy_features, permissions
      )
      VALUES (
        ${id}, ${appData.name}, ${trustiScore}, ${grade},
        ${appData.category || 'Application'}, ${appData.icon || null},
        ${appData.color || 'bg-slate-600'}, ${appData.reason || ''},
        ${appData.playStoreUrl || null}, ${appData.appleStoreUrl || null}, ${appData.fDroidUrl || null},
        ${appData.githubUrl || null}, ${appData.otherStoreUrl || null},
        ${appData.website || null}, ${appData.description || null},
        ${appData.developer || null}, ${appData.license || null},
        ${appData.isOpenSource || false}, ${appData.isEuropean || false},
        ${appData.jurisdiction || null}, ${appData.appType || 'regular'},
        ${appData.show_in_awards !== undefined ? Number(appData.show_in_awards) : (appData.showInAwards === true ? 1 : 0)},
        ${appData.show_in_onboarding !== undefined ? Number(appData.show_in_onboarding) : (appData.showInOnboarding !== false ? 1 : 0)},
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
    
    const relations = await getAppRelations(apps[0].id);
    return formatAppFromDB(apps[0], relations);
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
    appData = await enrichFromPlayStore(appData);
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
        f_droid_url = COALESCE(${appData.fDroidUrl}, f_droid_url),
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
        show_in_onboarding = COALESCE(${
          appData.show_in_onboarding !== undefined ? Number(appData.show_in_onboarding) :
          (appData.showInOnboarding !== undefined ? (appData.showInOnboarding ? 1 : 0) : null)
        }, show_in_onboarding),
        popularity = COALESCE(${appData.popularity !== undefined ? appData.popularity : null}, popularity),
        privacy_features = COALESCE(${appData.privacyFeatures !== undefined ? JSON.stringify(appData.privacyFeatures || {}) : null}, privacy_features),
        permissions = COALESCE(${appData.permissions !== undefined ? JSON.stringify(appData.permissions || []) : null}, permissions),
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
    
    const relations = await getAppRelations(apps[0].id);
    return formatAppFromDB(apps[0], relations);
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
