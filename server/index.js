import express from 'express';
import cors from 'cors';
import gplay from 'google-play-scraper';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

// ======================
// TOP APPS (Google Play)
// ======================

// Helper function to calculate grade for Google Play apps
const calculatePlayStoreGrade = (app) => {
  let score = 0;
  
  if (app.free) score += 20;
  if (app.adSupported === false) score += 30;
  if (app.containsAds === false) score += 30;
  if (app.offersIAP === false) score += 20;
  
  if (score >= 90) return 'A';
  if (score >= 70) return 'B';
  if (score >= 50) return 'C';
  if (score >= 30) return 'D';
  return 'E';
};

// Helper function to generate reason for Play Store
const generatePlayStoreReason = (grade) => {
  const reasons = {
    'A': 'Application gratuite sans publicité ni achats intégrés. Excellente protection de la vie privée.',
    'B': 'Peu de données collectées, bonne protection de la vie privée.',
    'C': 'Collecte modérée de données. Protection moyenne de la vie privée.',
    'D': 'Collecte importante de données. Protection limitée de la vie privée.',
    'E': 'Collecte excessive de données. Faible protection de la vie privée.'
  };
  return reasons[grade] || 'Données non disponibles';
};

// Helper function to get Play Store category color
const getPlayStoreCategoryColor = (category) => {
  const categoryMap = {
    'SOCIAL': 'blue',
    'COMMUNICATION': 'green',
    'GAME': 'purple',
    'PRODUCTIVITY': 'orange',
    'TOOLS': 'gray',
    'ENTERTAINMENT': 'pink',
    'FINANCE': 'yellow',
    'SHOPPING': 'red'
  };
  return categoryMap[category] || 'gray';
};

// Helper function to get Play Store category icon
const getPlayStoreCategoryIcon = (category) => {
  const iconMap = {
    'SOCIAL': 'Users',
    'COMMUNICATION': 'MessageCircle',
    'GAME': 'Gamepad2',
    'PRODUCTIVITY': 'Briefcase',
    'TOOLS': 'Wrench',
    'ENTERTAINMENT': 'Film',
    'FINANCE': 'DollarSign',
    'SHOPPING': 'ShoppingBag'
  };
  return iconMap[category] || 'Package';
};

// Helper function to find alternative
const findAlternative = (appId) => {
  const alternatives = {
    'com.facebook.katana': 'Mastodon',
    'com.whatsapp': 'Signal',
    'com.instagram.android': 'Pixelfed',
    'com.twitter.android': 'Mastodon',
    'com.google.android.apps.maps': 'OsmAnd',
    'com.spotify.music': 'VLC',
  };
  return alternatives[appId] || null;
};

// API endpoint to fetch top apps from Google Play
app.get('/api/top-apps', async (req, res) => {
  try {
    const apps = await gplay.list({
      collection: gplay.collection.TOP_FREE,
      category: gplay.category.APPLICATION,
      num: 50,
      country: 'fr',
      lang: 'fr',
      fullDetail: true
    });

    const mappedApps = apps.map((app, index) => {
      const grade = calculatePlayStoreGrade(app);
      return {
        id: app.appId,
        name: app.title,
        category: app.genre || 'Application',
        grade: grade,
        reason: generatePlayStoreReason(grade),
        icon: app.icon,
        downloads: app.installs || 'Non spécifié',
        developer: app.developer,
        alternative: findAlternative(app.appId),
        categoryColor: getPlayStoreCategoryColor(app.genreId),
        categoryIcon: getPlayStoreCategoryIcon(app.genreId),
        score: app.score,
        free: app.free,
        price: app.price || 0,
        adSupported: app.adSupported,
        containsAds: app.containsAds,
        offersIAP: app.offersIAP,
        url: app.url,
        description: app.description
      };
    });

    res.json({
      success: true,
      apps: mappedApps,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching apps:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      apps: []
    });
  }
});

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
app.get('/api/custom-trusti-apps', (req, res) => {
  try {
    const apps = readCustomApps();
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

// POST: Sauvegarder les apps personnalisées (bulk save)
app.post('/api/custom-trusti-apps', (req, res) => {
  try {
    const { apps } = req.body;
    
    if (!Array.isArray(apps)) {
      return res.status(400).json({
        success: false,
        error: 'Apps must be an array'
      });
    }

    const success = writeCustomApps(apps);
    
    if (success) {
      res.json({
        success: true,
        message: 'Custom apps saved successfully',
        apps: apps
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to save apps'
      });
    }
  } catch (error) {
    console.error('Error saving custom apps:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE: Supprimer une app personnalisée
app.delete('/api/custom-trusti-apps/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'App ID is required'
      });
    }

    const apps = readCustomApps();
    const filteredApps = apps.filter(app => app.id !== parseInt(id));
    const success = writeCustomApps(filteredApps);
    
    if (success) {
      res.json({
        success: true,
        message: 'App deleted successfully',
        apps: filteredApps
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to delete app'
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
app.get('/api/star-apps', (req, res) => {
  try {
    const apps = readStarApps();
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

// POST Star Apps (create/update)
app.post('/api/star-apps', (req, res) => {
  try {
    const { apps } = req.body;
    
    if (!Array.isArray(apps)) {
      return res.status(400).json({
        success: false,
        error: 'Apps must be an array'
      });
    }

    const success = writeStarApps(apps);
    
    if (success) {
      res.json({
        success: true,
        message: 'Star apps saved successfully',
        apps: readStarApps()
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to save star apps'
      });
    }
  } catch (error) {
    console.error('Error saving star apps:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE Star App
app.delete('/api/star-apps/:id', (req, res) => {
  try {
    const { id } = req.params;
    const apps = readStarApps();
    const filteredApps = apps.filter(app => app.id !== id);
    
    const success = writeStarApps(filteredApps);
    
    if (success) {
      res.json({
        success: true,
        message: 'Star app deleted successfully',
        apps: filteredApps
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to delete star app'
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`TrustiScore API running on http://localhost:${PORT}`);
});
