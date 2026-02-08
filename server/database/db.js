/**
 * Base de données JSON simple pour Trusti
 * Alternative à SQLite sans dépendances natives
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemins des fichiers
const DB_DIR = path.join(__dirname, 'data');
const APPS_DB = path.join(DB_DIR, 'apps.json');
const BACKUP_DIR = path.join(DB_DIR, 'backups');

// Structure de la base de données
const DB_STRUCTURE = {
  applications: [],
  relations: [],
  metadata: {
    version: 1,
    createdAt: new Date().toISOString(),
    lastUpdate: new Date().toISOString()
  }
};

/**
 * Initialiser la base de données
 */
export function initDatabase() {
  // Créer les dossiers si nécessaires
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  // Créer le fichier de BDD s'il n'existe pas
  if (!fs.existsSync(APPS_DB)) {
    saveDB(DB_STRUCTURE);
  }
}

/**
 * Charger la base de données
 */
export function loadDB() {
  try {
    if (!fs.existsSync(APPS_DB)) {
      return DB_STRUCTURE;
    }
    
    const data = fs.readFileSync(APPS_DB, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur chargement BDD:', error.message);
    return DB_STRUCTURE;
  }
}

/**
 * Sauvegarder la base de données
 */
export function saveDB(data) {
  try {
    // Mettre à jour le timestamp
    data.metadata.lastUpdate = new Date().toISOString();
    
    // Sauvegarder
    fs.writeFileSync(APPS_DB, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde BDD:', error.message);
    return false;
  }
}

/**
 * Créer une sauvegarde
 */
export function backup() {
  try {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}.json`);
    
    const data = loadDB();
    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log(`✅ Backup créé : ${backupPath}`);
    return true;
  } catch (error) {
    console.error('Erreur backup:', error.message);
    return false;
  }
}

/**
 * Nettoyer les anciennes sauvegardes (garder les 10 dernières)
 */
export function cleanOldBackups(keep = 10) {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-'))
      .sort()
      .reverse();
    
    if (files.length > keep) {
      const toDelete = files.slice(keep);
      toDelete.forEach(file => {
        fs.unlinkSync(path.join(BACKUP_DIR, file));
      });
      console.log(`🗑️  ${toDelete.length} anciennes sauvegardes supprimées`);
    }
  } catch (error) {
    console.error('Erreur nettoyage backups:', error.message);
  }
}

export default {
  initDatabase,
  loadDB,
  saveDB,
  backup,
  cleanOldBackups
};
