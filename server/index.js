import express from 'express';
import cors from 'cors';
import gplay from 'google-play-scraper';

const app = express();
const PORT = 3001;

// Enable CORS for frontend
app.use(cors());
app.use(express.json());

// Helper function to get category color
const getCategoryColor = (category) => {
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

// Helper function to get category icon
const getCategoryIcon = (category) => {
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

// Helper function to calculate grade
const calculateGrade = (app) => {
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

// Helper function to generate reason
const generateReason = (grade) => {
  const reasons = {
    'A': 'Application gratuite sans publicité ni achats intégrés. Excellente protection de la vie privée.',
    'B': 'Peu de données collectées, bonne protection de la vie privée.',
    'C': 'Collecte modérée de données. Protection moyenne de la vie privée.',
    'D': 'Collecte importante de données. Protection limitée de la vie privée.',
    'E': 'Collecte excessive de données. Faible protection de la vie privée.'
  };
  return reasons[grade] || 'Données non disponibles';
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

// API endpoint to fetch top apps
app.get('/api/top-apps', async (req, res) => {
  try {
    const apps = await gplay.list({
      collection: gplay.collection.TOP_FREE,
      category: gplay.category.APPLICATION,
      num: 20,
      country: 'fr',
      lang: 'fr',
      fullDetail: true
    });

    const mappedApps = apps.map((app, index) => {
      const grade = calculateGrade(app);
      return {
        id: app.appId,
        name: app.title,
        category: app.genre || 'Application',
        grade: grade,
        reason: generateReason(grade),
        icon: app.icon,
        downloads: app.installs || 'Non spécifié',
        developer: app.developer,
        alternative: findAlternative(app.appId),
        categoryColor: getCategoryColor(app.genreId),
        categoryIcon: getCategoryIcon(app.genreId),
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 TrustiScore API running on http://localhost:${PORT}`);
});
