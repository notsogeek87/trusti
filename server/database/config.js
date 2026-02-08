/**
 * Configuration de la base de données SQLite avec sql.js
 */
import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin de la base de données
const DB_PATH = path.join(__dirname, 'trusti.db');

let SQL = null;
let dbInstance = null;

/**
 * Initialiser sql.js
 */
async function initSQL() {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  return SQL;
}

/**
 * Obtenir ou créer une connexion à la base de données
 */
export async function getDatabase() {
  if (dbInstance) {
    return dbInstance;
  }
  
  const SQL = await initSQL();
  
  // Charger la BDD existante ou en créer une nouvelle
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    dbInstance = new SQL.Database(buffer);
  } else {
    dbInstance = new SQL.Database();
  }
  
  return dbInstance;
}

/**
 * Sauvegarder la base de données sur le disque
 */
export function saveDatabase(db) {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

/**
 * Fermer la connexion
 */
export function closeDatabase(db) {
  if (db) {
    db.close();
    if (dbInstance === db) {
      dbInstance = null;
    }
  }
}

export default getDatabase;
