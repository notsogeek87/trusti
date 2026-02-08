# 🚀 Guide de Démarrage Rapide - Modèle Application Trusti

## Installation

Le modèle est déjà intégré dans le projet Trusti. Aucune installation nécessaire !

## Utilisation en 5 minutes

### 1. Importer le modèle

```javascript
import { createApplication, APP_CATEGORIES } from '@/models';
```

### 2. Créer une application simple

```javascript
const signal = createApplication({
  id: 1001,
  name: "Signal",
  trustiScore: "A",
  category: APP_CATEGORIES.COMMUNICATION,
  icon: "💬",
  color: "bg-blue-600",
  reason: "Excellent respect de la vie privée"
});
```

### 3. Ajouter des liens de téléchargement

```javascript
const signalComplete = createApplication({
  id: 1001,
  name: "Signal",
  trustiScore: "A",
  category: APP_CATEGORIES.COMMUNICATION,
  icon: "💬",
  color: "bg-blue-600",
  reason: "Excellent respect de la vie privée",
  
  // Liens de téléchargement
  playStoreUrl: "https://play.google.com/store/apps/details?id=org.thoughtcrime.securesms",
  appleStoreUrl: "https://apps.apple.com/app/signal/id874139669",
  githubUrl: "https://github.com/signalapp"
});
```

### 4. Utiliser les méthodes utiles

```javascript
// Obtenir tous les liens
const links = signal.getDownloadLinks();
// { playStore: "...", appleStore: "...", github: "..." }

// Vérifier s'il y a des liens
if (signal.hasDownloadLink()) {
  console.log("Application téléchargeable");
}

// Obtenir le niveau de vie privée
console.log(signal.getPrivacyLevel());
// "Excellence en protection de la vie privée"
```

## Exemples Pratiques

### Créer une app avec toutes les options

```javascript
const protonMail = createApplication({
  // Obligatoire
  id: 1002,
  name: "Proton Mail",
  trustiScore: "A",
  category: "Email",
  icon: "📧",
  color: "bg-purple-700",
  reason: "Juridiction Suisse, chiffrement zero-knowledge",
  
  // Téléchargement
  playStoreUrl: "https://play.google.com/...",
  appleStoreUrl: "https://apps.apple.com/...",
  githubUrl: "https://github.com/ProtonMail",
  website: "https://proton.me/mail",
  
  // Relations
  alternativeAppIds: [],
  replacesAppIds: [123, 456], // IDs de Gmail, Outlook, etc.
  
  // Informations
  description: "Service d'email chiffré",
  developer: "Proton AG",
  license: "GPLv3",
  isOpenSource: true,
  isEuropean: true,
  jurisdiction: "Suisse",
  
  // Vie privée
  privacyFeatures: {
    endToEndEncryption: true,
    noTracking: true,
    gdprCompliant: true,
    noAds: true
  }
});
```

### Filtrer des applications

```javascript
import { filterByMinScore, filterOpenSource } from '@/models';

// Toutes les apps avec score A ou B
const goodApps = filterByMinScore(allApps, 'B');

// Apps open-source
const openSourceApps = filterOpenSource(allApps);
```

### Valider des données

```javascript
import { validateApplication } from '@/models';

const validation = validateApplication(myAppData);

if (!validation.valid) {
  console.error("Erreurs:", validation.errors);
} else {
  console.log("Application valide !");
}
```

### Migrer l'ancien format

```javascript
import { migrateFromOldFormat } from '@/models';

// Ancien format
const oldApp = {
  id: 1,
  name: "ChatGPT",
  grade: "B",
  category: "IA",
  icon: "🤖",
  reason: "Hébergé aux USA"
};

// Nouveau format
const newApp = migrateFromOldFormat(oldApp);
```

## Scores Trusti

| Score | Signification |
|-------|--------------|
| **A** | Excellence en protection de la vie privée |
| **B** | Bon respect de la vie privée |
| **C** | Respect moyen avec quelques compromis |
| **D** | Pratiques préoccupantes |
| **E** | Dangereux pour la vie privée |

## Catégories Disponibles

```javascript
import { APP_CATEGORIES } from '@/models';

APP_CATEGORIES.COMMUNICATION    // "Communication"
APP_CATEGORIES.PRODUCTIVITY     // "Productivité"
APP_CATEGORIES.SOCIAL_NETWORK   // "Réseaux Sociaux"
APP_CATEGORIES.E_COMMERCE       // "E-commerce"
APP_CATEGORIES.CLOUD_STORAGE    // "Cloud / Stockage"
APP_CATEGORIES.BROWSER          // "Navigateur"
APP_CATEGORIES.AI               // "IA / Productivité"
APP_CATEGORIES.EMAIL            // "Email"
APP_CATEGORIES.SECURITY         // "Sécurité"
APP_CATEGORIES.OTHER            // "Autre"
```

## Tester votre code

Exécutez les tests fournis :

```bash
node src/models/test.js
```

## Ressources

- 📖 [README.md](./README.md) - Documentation complète
- 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture détaillée
- 💡 [examples.js](./examples.js) - Exemples complets
- 🧪 [test.js](./test.js) - Suite de tests

## Besoin d'aide ?

1. Consultez les [exemples](./examples.js)
2. Lisez la [documentation complète](./README.md)
3. Regardez l'[architecture](./ARCHITECTURE.md)
4. Testez avec [test.js](./test.js)

---

**Prêt à créer des applications Trusti ! 🎉**
