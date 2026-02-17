import * as dotenv from 'dotenv';
// Charger les variables d'environnement EN PREMIER
dotenv.config();

import express from 'express';
import cors from 'cors';
import gplay from 'google-play-scraper';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Utiliser service-postgres pour Neon (base de données distante)
import dbService from './database/service-postgres.js';

const app = express();
const PORT = 3001;

// Enable CORS for frontend
app.use(cors());
app.use(express.json());

// Configuration des chemins pour ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data', 'custom-trusti-apps.json');
const STAR_APPS_FILE = path.join(__dirname, 'data', 'star-apps.json');

// Créer le dossier data s'il n'existe pas
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

// Helper: Lire les apps personnalisées
const readCustomApps = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading custom apps:', error);
  }
  return [];
};

// Helper: Écrire les apps personnalisées
const writeCustomApps = (apps) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(apps, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing custom apps:', error);
    return false;
  }
};

// ==============================
// TRUSTI APPS (siksik.org list)
// ==============================

// Cache pour les icônes
const iconCache = {};

// URLs personnalisées fiables pour les apps populaires
const CUSTOM_ICONS = {
  // Multimédia
  'org.videolan.vlc': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/VLC_Icon.svg/240px-VLC_Icon.svg.png',
  'org.schabi.newpipe': 'https://raw.githubusercontent.com/TeamNewPipe/NewPipe/dev/assets/new_pipe_icon_5.png',
  'de.danoeh.antennapod': 'https://raw.githubusercontent.com/AntennaPod/AntennaPod/develop/images/antenna.png',
  
  // Communication
  'org.thoughtcrime.securesms': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Signal-Logo.svg/240px-Signal-Logo.svg.png',
  'org.telegram.messenger': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/240px-Telegram_logo.svg.png',
  'com.fsck.k9': 'https://raw.githubusercontent.com/thundernest/k-9/main/art/icon.svg',
  'eu.faircode.email': 'https://raw.githubusercontent.com/M66B/FairEmail/master/app/src/main/ic_launcher-playstore.png',
  
  // Calendrier
  'ws.xsoh.etar': 'https://raw.githubusercontent.com/Etar-Group/Etar-Calendar/master/metadata/en-US/images/icon.png',
  
  // Sécurité
  'eu.faircode.netguard': 'https://raw.githubusercontent.com/M66B/NetGuard/master/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png',
  'io.ente.auth': 'https://ente.io/images/logo.png'
};

// Helper: Obtenir l'URL de l'icône (URLs personnalisées d'abord, puis Play Store)
const getAppIcon = async (packageName) => {
  // Vérifier le cache
  if (iconCache[packageName]) {
    return iconCache[packageName];
  }

  // 1. Priorité : icônes personnalisées fiables
  if (CUSTOM_ICONS[packageName]) {
    iconCache[packageName] = CUSTOM_ICONS[packageName];
    return CUSTOM_ICONS[packageName];
  }

  // 2. Fallback : essayer Play Store
  try {
    const appInfo = await gplay.app({ appId: packageName });
    if (appInfo && appInfo.icon) {
      iconCache[packageName] = appInfo.icon;
      return appInfo.icon;
    }
  } catch (error) {
    // App probablement pas sur Play Store (F-Droid uniquement)
  }

  // 3. Dernier recours : emoji
  iconCache[packageName] = '📱';
  return '📱';
};

// Liste d'applications recommandées par siksik.org
// Source: https://siksik.org/applications-alternatives-pour-android-plus-respectueuses-de-la-vie-privee/
const RECOMMENDED_APPS = [
  // Edition, prise de notes, dessin
  { name: 'Simplenotes', package: 'com.automattic.simplenote', category: 'Productivité', description: 'Prise de notes simple et synchronisée' },
  { name: 'NotesNook', package: 'com.streetwriters.notesnook', category: 'Productivité', description: 'Prise de notes avec chiffrement de bout en bout' },
  { name: 'Collabora Office', package: 'com.collabora.libreoffice', category: 'Productivité', description: 'Suite bureautique complète (fichiers, tableur, classeur)' },
  { name: 'Simple Draw Pro', package: 'com.simplemobiletools.draw.pro', category: 'Créativité', description: 'Application pour dessiner et annoter rapidement' },
  { name: 'MuPDF viewer', package: 'com.artifex.mupdf.viewer.app', category: 'Productivité', description: 'Lecteur de fichiers PDF léger et rapide' },
  { name: 'Etar', package: 'ws.xsoh.etar', category: 'Productivité', description: 'Agenda open source et respectueux de la vie privée' },
  
  // Images, photos, vidéos, audio
  { name: 'Open Camera', package: 'net.sourceforge.opencamera', category: 'Photo', description: 'Appareil photo open source avec de nombreuses fonctionnalités' },
  { name: 'Simple Gallery Pro', package: 'com.simplemobiletools.gallery.pro', category: 'Photo', description: 'Galerie d\'images simple et privée' },
  { name: 'VLC', package: 'org.videolan.vlc', category: 'Multimédia', description: 'Lecteur vidéo/audio universel' },
  { name: 'NewPipe', package: 'org.schabi.newpipe', category: 'Multimédia', description: 'YouTube sans publicités ni trackers' },
  { name: 'Vinyl Music Player', package: 'com.poupa.vinylmusicplayer', category: 'Musique', description: 'Lecteur audio élégant' },
  { name: 'Vanilla Music', package: 'ch.blinkenlights.android.vanilla', category: 'Musique', description: 'Lecteur audio minimaliste' },
  { name: 'RadioDroid', package: 'net.programmierecke.radiodroid2', category: 'Musique', description: 'Écouter la radio en streaming' },
  { name: 'Voice Recorder', package: 'com.simplemobiletools.voicerecorder', category: 'Outils', description: 'Enregistreur audio simple' },
  { name: 'AntennaPod', package: 'de.danoeh.antennapod', category: 'Musique', description: 'Gestionnaire de podcasts' },
  
  // Communication
  { name: 'QKSMS', package: 'com.moez.QKSMS', category: 'Communication', description: 'Application SMS/MMS open source' },
  { name: 'Signal', package: 'org.thoughtcrime.securesms', category: 'Communication', description: 'Messagerie chiffrée de bout en bout' },
  { name: 'Telegram', package: 'org.telegram.messenger', category: 'Communication', description: 'Messagerie rapide et sécurisée' },
  { name: 'Session', package: 'network.loki.messenger', category: 'Communication', description: 'Messagerie anonyme et décentralisée' },
  { name: 'SimpleX Chat', package: 'chat.simplex.app', category: 'Communication', description: 'Messagerie privée sans identifiant' },
  { name: 'FairEmail', package: 'eu.faircode.email', category: 'Communication', description: 'Client email respectueux de la vie privée' },
  { name: 'K9-Mail', package: 'com.fsck.k9', category: 'Communication', description: 'Client email open source' },
  { name: 'Tuta Mail', package: 'de.tutao.tutanota', category: 'Communication', description: 'Email chiffré de bout en bout' },
  
  // Utilitaires
  { name: 'Alarm Klock', package: 'com.angrydoughnuts.android.alarmclock', category: 'Outils', description: 'Application réveil et alarme' },
  { name: 'Simple File Manager Pro', package: 'com.simplemobiletools.filemanager.pro', category: 'Outils', description: 'Gestionnaire de fichiers simple' },
  { name: 'Unit Converter Ultimate', package: 'com.physphil.android.unitconverterultimate', category: 'Outils', description: 'Convertisseur d\'unités très complet' },
  { name: 'Flashlight', package: 'com.simplemobiletools.flashlight', category: 'Outils', description: 'Lampe de poche simple' },
  { name: 'Red Moon', package: 'com.jmstudios.redmoon', category: 'Santé', description: 'Filtre anti lumière bleue' },
  { name: 'QR Scanner', package: 'com.secuso.privacyFriendlyCodeScanner', category: 'Outils', description: 'Scanner de codes QR' },
  { name: 'OpenBoard', package: 'org.dslul.openboard.inputmethod.latin', category: 'Outils', description: 'Clavier multi-langues open source' },
  
  // Navigation
  { name: 'Magic Earth', package: 'com.generalmagic.magicearth', category: 'Navigation', description: 'Carte et navigation avec mode hors ligne' },
  { name: 'GPSTest', package: 'com.android.gpstest.osmdroid', category: 'Navigation', description: 'GPS et waypoints' },
  
  // Réseaux sociaux
  { name: 'SlimSocial for Twitter', package: 'it.rignanese.leo.slimtwitter', category: 'Social', description: 'Client Twitter léger et privé' },
  
  // Sécurité
  { name: 'Keepass2Android', package: 'keepass2android.keepass2android', category: 'Sécurité', description: 'Gestionnaire de mots de passe' },
  { name: 'Ente Auth', package: 'io.ente.auth', category: 'Sécurité', description: 'Double authentification (2FA)' },
  { name: 'NetGuard', package: 'eu.faircode.netguard', category: 'Sécurité', description: 'Firewall et bloqueur de publicités' }
];

// Helper function to calculate TrustiScore
const calculateTrustiGrade = (category) => {
  if (category === 'Sécurité' || category === 'Communication') return 'A';
  return 'B';
};

// Helper function to get reason for TrustiScore
const getTrustiReason = (grade) => {
  if (grade === 'A') {
    return 'Application recommandée par siksik.org. Open source, sans tracker, protection maximale de la vie privée.';
  }
  return 'Application recommandée par siksik.org. Open source et respectueuse de votre vie privée.';
};

// Helper function to get category color
const getCategoryColor = (category) => {
  const colorMap = {
    'Communication': 'green',
    'Sécurité': 'emerald',
    'Productivité': 'blue',
    'Multimédia': 'purple',
    'Musique': 'pink',
    'Photo': 'orange',
    'Créativité': 'amber',
    'Outils': 'gray',
    'Navigation': 'cyan',
    'Social': 'indigo',
    'Santé': 'violet'
  };
  return colorMap[category] || 'gray';
};

// Helper function to get category icon
const getCategoryIcon = (category) => {
  const iconMap = {
    'Communication': 'MessageCircle',
    'Sécurité': 'Shield',
    'Productivité': 'Briefcase',
    'Multimédia': 'Film',
    'Musique': 'Music',
    'Photo': 'Camera',
    'Créativité': 'Palette',
    'Outils': 'Wrench',
    'Navigation': 'Map',
    'Social': 'Users',
    'Santé': 'Heart'
  };
  return iconMap[category] || 'Package';
};

// API endpoint to fetch privacy-friendly apps from siksik.org list
app.get('/api/trusti-apps', async (req, res) => {
  try {
    const mappedApps = await Promise.all(RECOMMENDED_APPS.map(async (app) => {
      const grade = calculateTrustiGrade(app.category);
      const icon = await getAppIcon(app.package);
      
      return {
        id: app.package,
        name: app.name,
        category: app.category,
        grade: grade,
        reason: getTrustiReason(grade),
        icon: icon,
        downloads: 'Recommandé siksik.org',
        developer: 'Open Source',
        alternative: null,
        categoryColor: getCategoryColor(app.category),
        categoryIcon: getCategoryIcon(app.category),
        score: grade === 'A' ? 5.0 : 4.5,
        free: true,
        price: 0,
        adSupported: false,
        containsAds: false,
        offersIAP: false,
        url: `https://f-droid.org/packages/${app.package}`,
        description: app.description,
        trackerCount: 0,
        isOpenSource: true,
        source: 'siksik'
      };
    }));

    // Trier : apps avec logos officiels en premier, puis par grade
    const sortedApps = mappedApps.sort((a, b) => {
      const aHasLogo = a.icon !== '📱';
      const bHasLogo = b.icon !== '📱';
      
      // Apps avec logo en premier
      if (aHasLogo && !bHasLogo) return -1;
      if (!aHasLogo && bHasLogo) return 1;
      
      // Sinon trier par grade (A avant B)
      if (a.grade !== b.grade) {
        return a.grade.charCodeAt(0) - b.grade.charCodeAt(0);
      }
      
      // Finalement par nom
      return a.name.localeCompare(b.name);
    });

    res.json({
      success: true,
      apps: sortedApps,
      source: 'siksik.org',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching trusti apps:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      apps: []
    });
  }
});

// ======================
// CUSTOM TRUSTI APPS
// ======================

// GET: Récupérer les apps personnalisées
app.get('/api/custom-trusti-apps', async (req, res) => {
  try {
    const apps = await dbService.getAppsByType('trusti');
    res.json({
      success: true,
      apps: apps
    });
  } catch (error) {
    console.error('Error fetching custom apps:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      apps: []
    });
  }
});

// POST: Créer une nouvelle app personnalisée
app.post('/api/custom-trusti-apps', async (req, res) => {
  try {
    const appData = { ...req.body, appType: 'trusti' };
    const newApp = await dbService.createApp(appData);
    
    res.json({
      success: true,
      message: 'Custom app created successfully',
      app: newApp
    });
  } catch (error) {
    console.error('Error creating custom app:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT: Mettre à jour une app personnalisée
app.put('/api/custom-trusti-apps', async (req, res) => {
  try {
    const { id, ...appData } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'App ID is required'
      });
    }
    
    const updatedApp = await dbService.updateApp(id, { ...appData, appType: 'trusti' });
    
    if (updatedApp) {
      res.json({
        success: true,
        message: 'Custom app updated successfully',
        app: updatedApp
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'App not found'
      });
    }
  } catch (error) {
    console.error('Error updating custom app:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE: Supprimer une app personnalisée
app.delete('/api/custom-trusti-apps', async (req, res) => {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'App ID is required'
      });
    }

    const success = await dbService.deleteApp(id);
    
    if (success) {
      res.json({
        success: true,
        message: 'App deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'App not found'
      });
    }
  } catch (error) {
    console.error('Error deleting custom app:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==============================
// STAR APPS (Sélection Admin)
// ==============================

// Helper: Lire les StarApps
const readStarApps = () => {
  try {
    if (fs.existsSync(STAR_APPS_FILE)) {
      const data = fs.readFileSync(STAR_APPS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading star apps:', error);
  }
  return [];
};

// Helper: Écrire les StarApps
const writeStarApps = (apps) => {
  try {
    fs.writeFileSync(STAR_APPS_FILE, JSON.stringify(apps, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing star apps:', error);
    return false;
  }
};

// GET Star Apps
app.get('/api/star-apps', async (req, res) => {
  try {
    const apps = await dbService.getAppsByType('star');
    res.json({
      success: true,
      apps: apps
    });
  } catch (error) {
    console.error('Error getting star apps:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      apps: []
    });
  }
});

// POST: Créer une nouvelle star app
app.post('/api/star-apps', async (req, res) => {
  try {
    const appData = { ...req.body, appType: 'star' };
    const newApp = await dbService.createApp(appData);
    
    res.json({
      success: true,
      message: 'Star app created successfully',
      app: newApp
    });
  } catch (error) {
    console.error('Error creating star app:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT: Mettre à jour une star app
app.put('/api/star-apps', async (req, res) => {
  try {
    const { id, ...appData } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'App ID is required'
      });
    }
    
    const updatedApp = await dbService.updateApp(id, { ...appData, appType: 'star' });
    
    if (updatedApp) {
      res.json({
        success: true,
        message: 'Star app updated successfully',
        app: updatedApp
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'App not found'
      });
    }
  } catch (error) {
    console.error('Error updating star app:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE Star App
app.delete('/api/star-apps', async (req, res) => {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'App ID is required'
      });
    }
    
    const success = await dbService.deleteApp(id);
    
    if (success) {
      res.json({
        success: true,
        message: 'Star app deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'App not found'
      });
    }
  } catch (error) {
    console.error('Error deleting star app:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==============================
// ALL APPS (Unified endpoint)
// ==============================

// GET all apps (combines custom-trusti-apps and star-apps)
app.get('/api/apps', async (req, res) => {
  try {
    // Extraire les paramètres de pagination et de recherche
    const { type, limit, offset, page, search, q } = req.query;
    
    // Si une recherche est demandée, utiliser searchApps
    const searchQuery = search || q;
    if (searchQuery && searchQuery.trim()) {
      const apps = await dbService.searchApps(searchQuery.trim());
      return res.json({
        success: true,
        apps: apps,
        pagination: {
          total: apps.length,
          limit: 0,
          offset: 0,
          page: 1,
          totalPages: 1,
          hasMore: false
        }
      });
    }
    
    // Calculer les paramètres de pagination
    const paginationLimit = parseInt(limit) || 0; // 0 = pas de limite (tout)
    let paginationOffset = parseInt(offset) || 0;
    
    // Si page est fourni, calculer l'offset
    if (page && paginationLimit > 0) {
      const pageNum = parseInt(page);
      paginationOffset = (pageNum - 1) * paginationLimit;
    }
    
    const paginationOptions = {
      limit: paginationLimit,
      offset: paginationOffset
    };
    
    // Get apps from database avec pagination
    let result;
    if (type) {
      result = await dbService.getAppsByType(type, paginationOptions);
    } else {
      result = await dbService.getAllApps(paginationOptions);
    }
    
    res.json({
      success: true,
      apps: result.apps,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        page: paginationLimit > 0 ? Math.floor(paginationOffset / paginationLimit) + 1 : 1,
        totalPages: paginationLimit > 0 ? Math.ceil(result.total / paginationLimit) : 1,
        hasMore: paginationLimit > 0 ? (paginationOffset + paginationLimit) < result.total : false
      }
    });
  } catch (error) {
    console.error('Error fetching all apps:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`TrustiScore API running on http://localhost:${PORT}`);
});
