// Vercel Serverless Function - TrustiApps
// Liste d'applications recommandées par siksik.org
// Source: https://siksik.org/applications-alternatives-pour-android-plus-respectueuses-de-la-vie-privee/

import gplay from 'google-play-scraper';

// Cache pour les icônes
const iconCache = {};

// Helper: Obtenir l'URL de l'icône depuis le Play Store
const getAppIcon = async (packageName) => {
  // Vérifier le cache
  if (iconCache[packageName]) {
    return iconCache[packageName];
  }

  // Récupérer depuis Play Store
  try {
    const appInfo = await gplay.app({ appId: packageName });
    if (appInfo && appInfo.icon) {
      iconCache[packageName] = appInfo.icon;
      return appInfo.icon;
    }
  } catch (error) {
    // App probablement pas sur Play Store (F-Droid uniquement)
  }

  // Dernier recours : emoji
  iconCache[packageName] = '📱';
  return '📱';
};

// Liste d'applications recommandées (toutes open source et respectueuses de la vie privée)
const RECOMMENDED_APPS = [
  // Edition, prise de notes, dessin
  { name: 'Simplenotes', package: 'com.automattic.simplenote', category: 'Productivité', description: 'Prise de notes simple et synchronisée' },
  { name: 'NotesNook', package: 'com.streetwriters.notesnook', category: 'Productivité', description: 'Prise de notes avec chiffrement de bout en bout' },
  { name: 'Collabora Office', package: 'com.collabora.libreoffice', category: 'Productivité', description: 'Suite bureautique complète (fichiers, tableur, classeur)' },
  { name: 'Simple Draw Pro', package: 'com.simplemobiletools.draw.pro', category: 'Créativité', description: 'Application pour dessiner et annoter rapidement' },
  { name: 'MuPDF viewer', package: 'com.artifex.mupdf.viewer.app', category: 'Productivité', description: 'Lecteur de fichiers PDF léger et rapide' },
  
  // Agenda
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
  
  // Email
  { name: 'FairEmail', package: 'eu.faircode.email', category: 'Communication', description: 'Client email respectueux de la vie privée' },
  { name: 'K9-Mail', package: 'com.fsck.k9', category: 'Communication', description: 'Client email open source' },
  { name: 'Tuta Mail', package: 'de.tutao.tutanota', category: 'Communication', description: 'Email chiffré de bout en bout' },
  
  // Réveil
  { name: 'Alarm Klock', package: 'com.angrydoughnuts.android.alarmclock', category: 'Outils', description: 'Application réveil et alarme' },
  
  // Utilitaires
  { name: 'Simple File Manager Pro', package: 'com.simplemobiletools.filemanager.pro', category: 'Outils', description: 'Gestionnaire de fichiers simple' },
  { name: 'Unit Converter Ultimate', package: 'com.physphil.android.unitconverterultimate', category: 'Outils', description: 'Convertisseur d\'unités très complet' },
  { name: 'Flashlight', package: 'com.simplemobiletools.flashlight', category: 'Outils', description: 'Lampe de poche simple' },
  { name: 'Red Moon', package: 'com.jmstudios.redmoon', category: 'Santé', description: 'Filtre anti lumière bleue' },
  { name: 'QR Scanner', package: 'com.secuso.privacyFriendlyCodeScanner', category: 'Outils', description: 'Scanner de codes QR' },
  
  // Clavier
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

// Helper: Calculer le grade (toutes ces apps sont recommandées donc A ou B)
const calculateTrustiGrade = (category) => {
  // Les apps de sécurité et communication chiffrée ont un A
  if (category === 'Sécurité' || category === 'Communication') return 'A';
  // Les autres apps recommandées ont un B
  return 'B';
};

// Helper: Générer la raison du grade
const generateReason = (grade, category) => {
  if (grade === 'A') {
    return 'Application recommandée par siksik.org. Open source, sans tracker, protection maximale de la vie privée.';
  }
  return 'Application recommandée par siksik.org. Open source et respectueuse de votre vie privée.';
};

// Helper: Obtenir la couleur de catégorie
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

// Helper: Obtenir l'icône de catégorie
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

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Mapper les apps recommandées à notre format
    const mappedApps = await Promise.all(RECOMMENDED_APPS.map(async (app) => {
      const grade = calculateTrustiGrade(app.category);
      const icon = await getAppIcon(app.package);
      
      return {
        id: app.package,
        name: app.name,
        category: app.category,
        grade: grade,
        reason: generateReason(grade, app.category),
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
}
