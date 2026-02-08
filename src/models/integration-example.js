/**
 * 🔄 Exemple d'intégration du modèle Application dans le projet Trusti
 * 
 * Ce fichier montre comment intégrer le nouveau modèle d'application
 * dans le code existant du projet Trusti.
 */

// ============================================================================
// 1. MIGRATION DES DONNÉES EXISTANTES
// ============================================================================

import { migrateFromOldFormat, validateApplication, createApplication } from './index.js';
import { APPS_DATA } from '../constants/appsData.js';

/**
 * Migrer toutes les applications de l'ancien format vers le nouveau
 */
export function migrateAllApps() {
  console.log('🔄 Migration des applications...\n');
  
  const migratedApps = APPS_DATA.map(oldApp => {
    try {
      const newApp = migrateFromOldFormat(oldApp);
      const validation = validateApplication(newApp);
      
      if (!validation.valid) {
        console.warn(`⚠️  ${oldApp.name} : ${validation.errors.join(', ')}`);
      } else {
        console.log(`✅ ${oldApp.name} migré avec succès`);
      }
      
      return newApp;
    } catch (error) {
      console.error(`❌ Erreur lors de la migration de ${oldApp.name}:`, error.message);
      return null;
    }
  }).filter(app => app !== null);
  
  console.log(`\n✨ ${migratedApps.length}/${APPS_DATA.length} applications migrées\n`);
  return migratedApps;
}

// ============================================================================
// 2. UTILISATION DANS LES COMPOSANTS REACT
// ============================================================================

/**
 * Hook personnalisé pour gérer les applications
 */
export function useApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadApps() {
      try {
        setLoading(true);
        
        // Charger depuis l'API
        const response = await fetch('/api/trusti-apps');
        const data = await response.json();
        
        // Valider et créer les instances
        const validApps = data
          .map(appData => {
            try {
              return createApplication(appData);
            } catch (error) {
              console.error(`Erreur avec ${appData?.name}:`, error);
              return null;
            }
          })
          .filter(app => app !== null);
        
        setApps(validApps);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadApps();
  }, []);

  return { apps, loading, error };
}

/**
 * Exemple de composant AppCard avec le nouveau modèle
 */
export function EnhancedAppCard({ app }) {
  const links = app.getDownloadLinks();
  const privacyLevel = app.getPrivacyLevel();
  
  return (
    <div className="app-card">
      <div className="app-header">
        <div className={`app-icon ${app.color}`}>
          {app.icon}
        </div>
        <div>
          <h3>{app.name}</h3>
          <span className="category">{app.category}</span>
        </div>
        <ScoreIndicator grade={app.trustiScore} />
      </div>
      
      <p className="reason">{app.reason}</p>
      <p className="privacy-level">{privacyLevel}</p>
      
      {/* Affichage des badges */}
      <div className="badges">
        {app.isOpenSource && <Badge>Open Source</Badge>}
        {app.isEuropean && <Badge>🇪🇺 Européen</Badge>}
        {app.privacyFeatures.endToEndEncryption && <Badge>🔒 E2E</Badge>}
        {app.privacyFeatures.gdprCompliant && <Badge>✓ RGPD</Badge>}
      </div>
      
      {/* Liens de téléchargement */}
      {Object.keys(links).length > 0 && (
        <div className="download-links">
          {links.playStore && (
            <a href={links.playStore} target="_blank" rel="noopener">
              Play Store
            </a>
          )}
          {links.appleStore && (
            <a href={links.appleStore} target="_blank" rel="noopener">
              App Store
            </a>
          )}
          {links.github && (
            <a href={links.github} target="_blank" rel="noopener">
              GitHub
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 3. UTILISATION DANS L'API
// ============================================================================

/**
 * API Route : GET /api/trusti-apps
 */
export async function getTrustiAppsHandler(req, res) {
  try {
    // Charger depuis la base de données ou fichier JSON
    const rawApps = await loadAppsFromDatabase();
    
    // Valider et formater
    const validatedApps = rawApps
      .map(app => {
        const validation = validateApplication(app);
        if (validation.valid) {
          return new TrustiApplication(app).toJSON();
        }
        return null;
      })
      .filter(app => app !== null);
    
    res.status(200).json(validatedApps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * API Route : POST /api/trusti-apps
 */
export async function createTrustiAppHandler(req, res) {
  try {
    // Valider les données reçues
    const validation = validateApplication(req.body);
    
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Données invalides',
        details: validation.errors 
      });
    }
    
    // Créer l'application
    const app = createApplication(req.body);
    
    // Sauvegarder dans la base de données
    await saveAppToDatabase(app.toJSON());
    
    res.status(201).json(app.toJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * API Route : PUT /api/trusti-apps/:id
 */
export async function updateTrustiAppHandler(req, res) {
  try {
    const { id } = req.params;
    
    // Charger l'app existante
    const existingApp = await loadAppFromDatabase(id);
    if (!existingApp) {
      return res.status(404).json({ error: 'Application non trouvée' });
    }
    
    // Fusionner les données
    const updatedData = {
      ...existingApp,
      ...req.body,
      id, // Garder l'ID original
      updatedAt: new Date().toISOString()
    };
    
    // Valider
    const validation = validateApplication(updatedData);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Données invalides',
        details: validation.errors 
      });
    }
    
    // Créer et sauvegarder
    const app = createApplication(updatedData);
    await saveAppToDatabase(app.toJSON());
    
    res.status(200).json(app.toJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ============================================================================
// 4. FILTRES ET RECHERCHE AVANCÉS
// ============================================================================

import {
  filterByMinScore,
  filterByCategory,
  filterOpenSource,
  filterEuropean,
  searchByName,
  findAlternatives
} from './index.js';

/**
 * Hook pour filtrer les applications
 */
export function useFilteredApps(apps, filters) {
  return useMemo(() => {
    let filtered = [...apps];
    
    // Filtre par score minimum
    if (filters.minScore) {
      filtered = filterByMinScore(filtered, filters.minScore);
    }
    
    // Filtre par catégorie
    if (filters.category) {
      filtered = filterByCategory(filtered, filters.category);
    }
    
    // Filtre open-source
    if (filters.openSourceOnly) {
      filtered = filterOpenSource(filtered);
    }
    
    // Filtre européen
    if (filters.europeanOnly) {
      filtered = filterEuropean(filtered);
    }
    
    // Recherche par nom
    if (filters.searchQuery) {
      filtered = searchByName(filtered, filters.searchQuery);
    }
    
    return filtered;
  }, [apps, filters]);
}

/**
 * Composant de filtre avancé
 */
export function AdvancedFilters({ onFilterChange }) {
  return (
    <div className="filters">
      <select onChange={e => onFilterChange({ minScore: e.target.value })}>
        <option value="">Tous les scores</option>
        <option value="A">A ou mieux</option>
        <option value="B">B ou mieux</option>
        <option value="C">C ou mieux</option>
      </select>
      
      <label>
        <input type="checkbox" onChange={e => onFilterChange({ openSourceOnly: e.target.checked })} />
        Open source uniquement
      </label>
      
      <label>
        <input type="checkbox" onChange={e => onFilterChange({ europeanOnly: e.target.checked })} />
        Applications européennes
      </label>
    </div>
  );
}

// ============================================================================
// 5. STATISTIQUES ET TABLEAUX DE BORD
// ============================================================================

import { generateStats } from './index.js';

/**
 * Composant Dashboard avec statistiques
 */
export function AppStatsDashboard({ apps }) {
  const stats = generateStats(apps);
  
  return (
    <div className="stats-dashboard">
      <StatCard title="Total" value={stats.total} />
      
      <div className="score-distribution">
        <h3>Répartition par score</h3>
        {Object.entries(stats.byScore).map(([score, count]) => (
          <div key={score} className="stat-bar">
            <span>{score}</span>
            <progress value={count} max={stats.total} />
            <span>{count}</span>
          </div>
        ))}
      </div>
      
      <div className="features-stats">
        <StatCard title="Open Source" value={stats.openSource} />
        <StatCard title="Européennes" value={stats.european} />
        <StatCard title="Sur Play Store" value={stats.withPlayStore} />
        <StatCard title="Sur App Store" value={stats.withAppleStore} />
        <StatCard title="Sur GitHub" value={stats.withGithub} />
      </div>
    </div>
  );
}

// ============================================================================
// 6. IMPORT/EXPORT
// ============================================================================

import { exportToJSON, importFromJSON } from './index.js';

/**
 * Exporter toutes les applications en JSON
 */
export function exportAppsToFile(apps) {
  const jsonData = JSON.stringify(apps.map(app => app.toJSON()), null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `trusti-apps-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Importer des applications depuis JSON
 */
export async function importAppsFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = importFromJSON(e.target.result);
      
      if (result.success) {
        resolve(result.app);
      } else {
        reject(new Error(result.errors.join(', ')));
      }
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

// ============================================================================
// 7. EXEMPLE COMPLET D'UTILISATION
// ============================================================================

/**
 * Exemple de page complète avec le nouveau modèle
 */
export function ApplicationsPage() {
  const { apps, loading, error } = useApplications();
  const [filters, setFilters] = useState({});
  
  const filteredApps = useFilteredApps(apps, filters);
  
  if (loading) return <Loader />;
  if (error) return <Error message={error} />;
  
  return (
    <div className="applications-page">
      <h1>Applications Trusti</h1>
      
      <AppStatsDashboard apps={apps} />
      
      <AdvancedFilters onFilterChange={setFilters} />
      
      <div className="apps-grid">
        {filteredApps.map(app => (
          <EnhancedAppCard key={app.id} app={app} />
        ))}
      </div>
      
      <button onClick={() => exportAppsToFile(apps)}>
        Exporter en JSON
      </button>
    </div>
  );
}

export default {
  migrateAllApps,
  useApplications,
  EnhancedAppCard,
  getTrustiAppsHandler,
  createTrustiAppHandler,
  updateTrustiAppHandler,
  useFilteredApps,
  AdvancedFilters,
  AppStatsDashboard,
  exportAppsToFile,
  importAppsFromFile,
  ApplicationsPage
};
