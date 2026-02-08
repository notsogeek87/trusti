# Modèle d'Application Trusti

Ce fichier décrit le modèle de données utilisé pour représenter les applications dans Trusti.

## Structure de l'objet Application

### Champs obligatoires

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `number\|string` | Identifiant unique de l'application |
| `name` | `string` | Nom de l'application |
| `trustiScore` | `string` | Note de A (excellent) à E (dangereux) |
| `category` | `string` | Catégorie (Communication, Productivité, etc.) |
| `icon` | `string` | URL de l'icône ou emoji |
| `color` | `string` | Classe Tailwind CSS pour la couleur |
| `reason` | `string` | Explication du score attribué |

### Champs de téléchargement

| Champ | Type | Description |
|-------|------|-------------|
| `playStoreUrl` | `string` | Lien Google Play Store |
| `appleStoreUrl` | `string` | Lien Apple App Store |
| `githubUrl` | `string` | Lien vers le dépôt GitHub |
| `otherStoreUrl` | `string` | Autre store (F-Droid, Microsoft Store, etc.) |
| `website` | `string` | Site web officiel |

### Champs relationnels

| Champ | Type | Description |
|-------|------|-------------|
| `alternativeAppIds` | `Array` | IDs des applications alternatives recommandées |
| `replacesAppIds` | `Array` | IDs des applications que celle-ci peut remplacer |

### Champs informatifs

| Champ | Type | Description |
|-------|------|-------------|
| `description` | `string` | Description détaillée |
| `developer` | `string` | Nom du développeur/éditeur |
| `license` | `string` | Type de licence |
| `isOpenSource` | `boolean` | Si l'application est open-source |
| `isEuropean` | `boolean` | Si hébergée/développée en Europe |
| `jurisdiction` | `string` | Juridiction légale (France, UE, USA, etc.) |

### Caractéristiques de vie privée

| Champ | Type | Description |
|-------|------|-------------|
| `privacyFeatures.endToEndEncryption` | `boolean` | Chiffrement de bout en bout |
| `privacyFeatures.noTracking` | `boolean` | Absence de tracking |
| `privacyFeatures.gdprCompliant` | `boolean` | Conformité RGPD |
| `privacyFeatures.noAds` | `boolean` | Absence de publicité |

## Utilisation

### Créer une nouvelle application

```javascript
import { createApplication, TrustiApplication, APP_CATEGORIES } from './models/Application.js';

// Méthode 1 : Avec la fonction factory (recommandée)
const signal = createApplication({
  id: 1001,
  name: "Signal",
  trustiScore: "A",
  category: APP_CATEGORIES.COMMUNICATION,
  icon: "💬",
  color: "bg-blue-600",
  reason: "Chiffrement de bout en bout, open-source",
  playStoreUrl: "https://play.google.com/store/apps/details?id=org.thoughtcrime.securesms",
  appleStoreUrl: "https://apps.apple.com/app/signal/id874139669",
  githubUrl: "https://github.com/signalapp",
  alternativeAppIds: [],
  replacesAppIds: [5] // Remplace WhatsApp
});

// Méthode 2 : Constructeur direct
const app = new TrustiApplication({
  id: 2001,
  name: "Firefox",
  trustiScore: "B",
  category: "Navigateur",
  icon: "🦊",
  color: "bg-orange-600",
  reason: "Open-source, respect de la vie privée",
  githubUrl: "https://github.com/mozilla/gecko-dev",
  website: "https://www.mozilla.org/firefox/",
  isOpenSource: true,
  privacyFeatures: {
    endToEndEncryption: false,
    noTracking: true,
    gdprCompliant: true,
    noAds: true
  }
});
```

### Valider une application

```javascript
try {
  app.validate();
  console.log("Application valide !");
} catch (error) {
  console.error("Erreur de validation:", error.message);
}
```

### Obtenir les liens de téléchargement

```javascript
const downloadLinks = app.getDownloadLinks();
// { playStore: "...", appleStore: "...", github: "..." }
```

### Convertir en JSON

```javascript
const appJSON = app.toJSON();
// Objet simple pour stockage ou API
```

### Vérifier les caractéristiques

```javascript
// A-t-elle un lien de téléchargement ?
if (app.hasDownloadLink()) {
  console.log("Liens disponibles");
}

// Quel niveau de vie privée ?
console.log(app.getPrivacyLevel());
// "Excellence en protection de la vie privée"
```

## Scores Trusti

- **A** : Excellence en protection de la vie privée
- **B** : Bon respect de la vie privée
- **C** : Respect moyen avec quelques compromis
- **D** : Pratiques préoccupantes
- **E** : Dangereux pour la vie privée

## Catégories disponibles

- Communication
- Productivité
- Réseaux Sociaux
- E-commerce
- Cloud / Stockage
- Navigateur
- IA / Productivité
- Email
- Sécurité
- Autre

## Migration depuis l'ancien format

Pour migrer depuis l'ancien format `appsData.js` :

```javascript
// Ancien format
const oldApp = {
  id: 1,
  name: "ChatGPT",
  grade: "B",
  category: "IA / Productivité",
  icon: "🤖",
  color: "bg-slate-800",
  reason: "Hébergé aux USA mais options de confidentialité avancées",
  alternative: "Mistral"
};

// Nouveau format
const newApp = createApplication({
  ...oldApp,
  trustiScore: oldApp.grade, // grade -> trustiScore
  alternativeAppIds: [1002], // Référence par ID plutôt que nom
  playStoreUrl: "...",
  appleStoreUrl: "..."
});
```

## Exemples complets

Voir `APPLICATION_EXAMPLE` dans [Application.js](./Application.js) pour un exemple complet avec tous les champs.
