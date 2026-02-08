/**
 * Schéma de base de données pour Trusti
 */

export const SCHEMA = `
-- Table des applications
CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  trustiScore TEXT NOT NULL CHECK(trustiScore IN ('A', 'B', 'C', 'D', 'E')),
  grade TEXT NOT NULL CHECK(grade IN ('A', 'B', 'C', 'D', 'E')),
  category TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  reason TEXT NOT NULL,
  
  -- Liens de téléchargement
  playStoreUrl TEXT,
  appleStoreUrl TEXT,
  githubUrl TEXT,
  otherStoreUrl TEXT,
  website TEXT,
  
  -- Métadonnées
  description TEXT,
  developer TEXT,
  license TEXT,
  isOpenSource INTEGER DEFAULT 0,
  isEuropean INTEGER DEFAULT 0,
  jurisdiction TEXT,
  
  -- Type d'application
  appType TEXT DEFAULT 'regular' CHECK(appType IN ('regular', 'trusti', 'star')),
  
  -- Privacy features (JSON stocké comme TEXT)
  privacyFeatures TEXT,
  
  -- Timestamps
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Table des relations entre applications (alternatives et remplacements)
CREATE TABLE IF NOT EXISTS app_relations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  appId TEXT NOT NULL,
  relatedAppId TEXT NOT NULL,
  relationType TEXT NOT NULL CHECK(relationType IN ('alternative', 'replaces')),
  
  FOREIGN KEY (appId) REFERENCES applications(id) ON DELETE CASCADE,
  UNIQUE(appId, relatedAppId, relationType)
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_app_name ON applications(name);
CREATE INDEX IF NOT EXISTS idx_app_category ON applications(category);
CREATE INDEX IF NOT EXISTS idx_app_score ON applications(trustiScore);
CREATE INDEX IF NOT EXISTS idx_app_type ON applications(appType);
CREATE INDEX IF NOT EXISTS idx_relations_app ON app_relations(appId);
CREATE INDEX IF NOT EXISTS idx_relations_related ON app_relations(relatedAppId);

-- Triggers pour mettre à jour updatedAt
CREATE TRIGGER IF NOT EXISTS update_app_timestamp 
AFTER UPDATE ON applications
BEGIN
  UPDATE applications SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
`;

export default SCHEMA;
