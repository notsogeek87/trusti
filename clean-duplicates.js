/**
 * Script pour nettoyer les doublons dans la base de données PostgreSQL de production
 */
import { getAllApps } from './server/database/service-postgres.js';
import { neon } from '@neondatabase/serverless';

// Charger .env en développement local
if (process.env.NODE_ENV !== 'production') {
  try {
    const dotenv = await import('dotenv');
    dotenv.config();
  } catch (e) {
    console.log('dotenv non disponible');
  }
}

const sql = neon(process.env.DATABASE_URL);

/**
 * Normalise un nom d'application pour la comparaison
 */
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/[:\-\–\—\.\,\(\)\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Identifie les doublons potentiels
 */
function findDuplicates(apps) {
  const duplicates = [];
  const seen = new Map();
  
  for (const app of apps) {
    const normalizedName = normalizeName(app.name);
    
    if (seen.has(normalizedName)) {
      const original = seen.get(normalizedName);
      duplicates.push({
        original: original,
        duplicate: app,
        normalizedName: normalizedName
      });
    } else {
      seen.set(normalizedName, app);
    }
  }
  
  return duplicates;
}

/**
 * Trouve les similaires (comme "leboncoin" vs "leboncoin, petites annonces")
 */
function findSimilar(apps) {
  const similar = [];
  
  for (let i = 0; i < apps.length; i++) {
    for (let j = i + 1; j < apps.length; j++) {
      const app1 = apps[i];
      const app2 = apps[j];
      
      const name1 = normalizeName(app1.name);
      const name2 = normalizeName(app2.name);
      
      // Vérifie si l'un est contenu dans l'autre
      if (name1.includes(name2) || name2.includes(name1)) {
        // Évite les faux positifs (ex: "google" dans "google docs" et "google sheets")
        const words1 = name1.split(' ');
        const words2 = name2.split(' ');
        
        if (Math.abs(words1.length - words2.length) <= 3) { // Max 3 mots de différence
          similar.push({
            app1: app1,
            app2: app2,
            reason: `"${name1}" et "${name2}" sont similaires`
          });
        }
      }
    }
  }
  
  return similar;
}

/**
 * Supprime une application de la base de données
 */
async function deleteApp(appId) {
  try {
    await sql`DELETE FROM apps WHERE id = ${appId}`;
    console.log(`✅ Supprimé: ${appId}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de la suppression de ${appId}:`, error);
    return false;
  }
}

/**
 * Script principal
 */
async function main() {
  try {
    console.log('🔍 Récupération de toutes les applications...');
    const apps = await getAllApps();
    console.log(`📱 ${apps.length} applications trouvées`);
    
    // 1. Chercher les doublons exacts
    console.log('\n🔍 Recherche de doublons exacts...');
    const duplicates = findDuplicates(apps);
    
    if (duplicates.length > 0) {
      console.log(`\n⚠️  ${duplicates.length} doublons trouvés :`);
      for (const dup of duplicates) {
        console.log(`- "${dup.original.name}" (${dup.original.id}) vs "${dup.duplicate.name}" (${dup.duplicate.id})`);
      }
    }
    
    // 2. Chercher les similaires
    console.log('\n🔍 Recherche d\'applications similaires...');
    const similar = findSimilar(apps);
    
    if (similar.length > 0) {
      console.log(`\n⚠️  ${similar.length} applications similaires trouvées :`);
      for (const sim of similar) {
        console.log(`- "${sim.app1.name}" (${sim.app1.id}) vs "${sim.app2.name}" (${sim.app2.id})`);
        console.log(`  Raison: ${sim.reason}`);
      }
    }
    
    // 3. Cas spécifique: leboncoin
    console.log('\n🔍 Recherche spécifique pour leboncoin...');
    const leboncoinApps = apps.filter(app => 
      normalizeName(app.name).includes('leboncoin')
    );
    
    if (leboncoinApps.length > 1) {
      console.log(`\n⚠️  ${leboncoinApps.length} applications leboncoin trouvées :`);
      for (const app of leboncoinApps) {
        console.log(`- "${app.name}" (${app.id})`);
      }
      
      // Garder seulement "Leboncoin" (plus court et propre)
      for (const app of leboncoinApps) {
        if (app.name !== 'Leboncoin' && normalizeName(app.name).includes('leboncoin')) {
          console.log(`\n🗑️  Suppression de "${app.name}" (${app.id})...`);
          await deleteApp(app.id);
        }
      }
    }
    
    // 4. Autres doublons courants
    const commonDuplicates = ['netflix', 'youtube', 'google', 'facebook'];
    
    for (const searchTerm of commonDuplicates) {
      const matchingApps = apps.filter(app => 
        normalizeName(app.name).includes(searchTerm) && 
        normalizeName(app.name) === searchTerm
      );
      
      if (matchingApps.length > 1) {
        console.log(`\n⚠️  ${matchingApps.length} doublons "${searchTerm}" trouvés - suppression des doublons...`);
        // Garder le premier, supprimer les autres
        for (let i = 1; i < matchingApps.length; i++) {
          console.log(`🗑️  Suppression de "${matchingApps[i].name}" (${matchingApps[i].id})...`);
          await deleteApp(matchingApps[i].id);
        }
      }
    }
    
    console.log('\n✅ Nettoyage terminé !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter le script
main();