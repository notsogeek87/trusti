/**
 * Script de setup de la base de données
 * Crée les tables nécessaires
 */
import { getDatabase, saveDatabase, closeDatabase } from './config.js';
import { SCHEMA } from './schema.js';

console.log('🔧 Setup de la base de données Trusti\n');

try {
  const db = await getDatabase();
  
  console.log('📝 Création des tables...');
  db.exec(SCHEMA);
  
  // Sauvegarder la base de données
  saveDatabase(db);
  
  console.log('✅ Base de données créée avec succès !');
  console.log('📍 Emplacement : server/database/trusti.db\n');
  
  // Vérifier les tables créées
  const result = db.exec(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    ORDER BY name
  `);
  
  console.log('📊 Tables créées :');
  if (result.length > 0) {
    result[0].values.forEach(row => {
      console.log(`   - ${row[0]}`);
    });
  }
  
  closeDatabase(db);
  console.log('\n🎉 Setup terminé !');
  
} catch (error) {
  console.error('❌ Erreur lors du setup :', error.message);
  process.exit(1);
}
