# Architecture du Modèle Application Trusti

## 📦 Structure des fichiers

```
src/models/
├── Application.js        # Classe principale et définitions
├── Application.d.ts      # Définitions TypeScript pour l'autocomplétion
├── utils.js             # Fonctions utilitaires (validation, filtrage, etc.)
├── examples.js          # Applications d'exemple
├── test.js              # Tests et validation
├── index.js             # Point d'entrée centralisé
├── README.md            # Documentation d'utilisation
└── ARCHITECTURE.md      # Ce fichier
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Trusti                        │
│                      (Modèle de données)                     │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  Application  │   │     utils     │   │   examples    │
│     .js       │   │      .js      │   │      .js      │
├───────────────┤   ├───────────────┤   ├───────────────┤
│ • Classe      │   │ • Validation  │   │ • Signal      │
│ • Types       │   │ • Filtrage    │   │ • WhatsApp    │
│ • Constantes  │   │ • Recherche   │   │ • TikTok      │
│ • Méthodes    │   │ • Stats       │   │ • Proton Mail │
└───────────────┘   └───────────────┘   └───────────────┘
```

## 📊 Modèle de données

### Champs principaux

```javascript
{
  // Identification
  id: number | string,
  name: string,
  
  // Évaluation
  trustiScore: "A" | "B" | "C" | "D" | "E",
  category: string,
  reason: string,
  
  // Visuel
  icon: string,  // URL ou emoji
  color: string, // Classe Tailwind
  
  // Téléchargement
  playStoreUrl: string,
  appleStoreUrl: string,
  githubUrl: string,
  otherStoreUrl: string,
  website: string,
  
  // Relations
  alternativeAppIds: Array<number|string>,
  replacesAppIds: Array<number|string>,
  
  // Métadonnées
  description: string,
  developer: string,
  license: string,
  isOpenSource: boolean,
  isEuropean: boolean,
  jurisdiction: string,
  
  // Vie privée
  privacyFeatures: {
    endToEndEncryption: boolean,
    noTracking: boolean,
    gdprCompliant: boolean,
    noAds: boolean
  }
}
```

## 🔄 Flux de données

```
┌─────────────┐
│  Données    │
│   brutes    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  sanitizeApp    │  ← Nettoyage
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  validateApp    │  ← Validation
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ createApp /     │  ← Création
│ TrustiApp()     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Application    │  ← Objet final
│    instance     │
└─────────────────┘
```

## 🛠️ Fonctions utilitaires

### Validation
- `validateApplication(app)` - Valide tous les champs
- `isValidUrl(url)` - Valide une URL
- `isValidTrustiScore(score)` - Valide un score

### Filtrage
- `filterByMinScore(apps, score)` - Filtre par score minimum
- `filterByCategory(apps, category)` - Filtre par catégorie
- `filterOpenSource(apps)` - Applications open-source uniquement
- `filterEuropean(apps)` - Applications européennes uniquement

### Recherche
- `searchByName(apps, query)` - Recherche par nom
- `findById(apps, id)` - Trouve par ID
- `findAlternatives(apps, app)` - Trouve les alternatives
- `findReplaceableApps(apps, app)` - Trouve les apps remplaçables

### Statistiques
- `generateStats(apps)` - Génère des stats complètes
- `compareByScore(a, b)` - Compare deux apps par score

### Import/Export
- `exportToJSON(app)` - Exporte en JSON formaté
- `importFromJSON(json)` - Importe et valide du JSON
- `migrateFromOldFormat(app)` - Migre l'ancien format

## 🎯 Cas d'usage

### 1. Créer une nouvelle application

```javascript
import { createApplication, APP_CATEGORIES } from '@/models';

const myApp = createApplication({
  id: Date.now(),
  name: "Mon Application",
  trustiScore: "A",
  category: APP_CATEGORIES.COMMUNICATION,
  icon: "📱",
  color: "bg-blue-600",
  reason: "Excellente protection de la vie privée",
  playStoreUrl: "https://...",
  appleStoreUrl: "https://...",
  githubUrl: "https://...",
  isOpenSource: true
});
```

### 2. Valider des données

```javascript
import { validateApplication } from '@/models';

const validation = validateApplication(rawData);
if (!validation.valid) {
  console.error(validation.errors);
}
```

### 3. Filtrer des applications

```javascript
import { filterByMinScore, filterOpenSource } from '@/models';

// Toutes les apps avec score A ou B
const goodApps = filterByMinScore(allApps, 'B');

// Apps open-source avec bon score
const openSourceGoodApps = filterOpenSource(goodApps);
```

### 4. Générer des statistiques

```javascript
import { generateStats } from '@/models';

const stats = generateStats(allApps);
console.log(`Total: ${stats.total}`);
console.log(`Score A: ${stats.byScore.A}`);
console.log(`Open-source: ${stats.openSource}`);
```

### 5. Migrer l'ancien format

```javascript
import { migrateFromOldFormat } from '@/models';
import { APPS_DATA } from '@/constants/appsData';

const migratedApps = APPS_DATA.map(migrateFromOldFormat);
```

## 🔗 Intégration avec l'API

```javascript
// api/trusti-apps.js
import { validateApplication, sanitizeApplication } from '@/models';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const validation = validateApplication(req.body);
    
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }
    
    const cleanApp = sanitizeApplication(req.body);
    // Sauvegarder cleanApp dans la base de données
    
    res.status(201).json(cleanApp);
  }
}
```

## 🧪 Tests

Exécuter les tests :

```bash
node src/models/test.js
```

Les tests couvrent :
- ✅ Création d'applications valides
- ✅ Validation des champs obligatoires
- ✅ Validation des scores
- ✅ Nettoyage et normalisation
- ✅ Migration de l'ancien format
- ✅ Filtrage et recherche
- ✅ Génération de statistiques
- ✅ Conversion JSON
- ✅ Caractéristiques de vie privée

## 📝 Bonnes pratiques

1. **Toujours valider** les données avant de créer une application
2. **Utiliser `createApplication()`** plutôt que le constructeur direct
3. **Nettoyer les données** avec `sanitizeApplication()` avant validation
4. **Utiliser les constantes** `APP_CATEGORIES` et `TRUSTI_GRADES`
5. **Typer avec JSDoc** pour une meilleure autocomplétion
6. **Migrer progressivement** l'ancien format vers le nouveau

## 🚀 Roadmap

- [ ] Ajouter un schéma JSON Schema pour validation externe
- [ ] Créer un validateur en ligne de commande
- [ ] Ajouter un système de versions pour les migrations
- [ ] Créer des hooks React pour faciliter l'utilisation
- [ ] Ajouter des tests unitaires avec Jest
- [ ] Documenter l'API REST complète

## 📚 Ressources

- [README.md](./README.md) - Guide d'utilisation
- [examples.js](./examples.js) - Exemples complets
- [test.js](./test.js) - Suite de tests
- [Application.d.ts](./Application.d.ts) - Types TypeScript
