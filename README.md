# TrustiScore

Application web moderne pour évaluer et comparer la fiabilité et la protection de la vie privée des applications numériques.

## 📁 Structure du Projet

```
src/
├── components/           # Composants React
│   ├── layout/          # Composants de mise en page (Header, Navigation)
│   ├── modals/          # Composants modales
│   ├── ui/              # Composants UI réutilisables (Logo, ScoreIndicator, etc.)
│   ├── AppCard.jsx      # Carte d'application dans la liste
│   ├── AppsList.jsx     # Liste d'applications
│   ├── ExplainerPanel.jsx    # Panneau explicatif
│   └── ShareButton.jsx  # Bouton de partage
├── constants/           # Constantes et données
│   ├── appsData.js      # Base de données des applications
│   ├── grades.js        # Configuration des notes A-E
│   └── tabs.js          # Configuration des onglets
├── hooks/               # Hooks React personnalisés
│   ├── useAppManagement.js   # Gestion de l'état des apps
│   └── useModals.js          # Gestion des modales
├── utils/               # Fonctions utilitaires
│   └── shareUtils.js    # Utilitaires de partage
├── styles/              # Styles CSS
│   └── index.css        # Styles globaux et Tailwind
├── App.jsx              # Composant principal
└── main.jsx             # Point d'entrée

```

## 🚀 Démarrage

```bash
# Installation des dépendances
npm install

# Lancement en mode développement
npm run dev

# Build pour la production
npm run build

# Prévisualisation du build
npm run preview
```

## 🏗️ Architecture

### Composants

- **Layout** : Header, Navigation
- **Modals** : AppDetailModal, ShareModal, TrustiShareModal, MigrationSelectorModal
- **UI** : ScoreIndicator, SearchBar
- **Features** : AppCard, AppsList, ExplainerPanel, ShareButton

### Hooks Personnalisés

- **useAppManagement** : Gère l'état global des applications, filtres, et recherche
- **useModals** : Gère l'ouverture/fermeture des différentes modales

### Constantes

- **appsData.js** : Base de données centralisée des applications
- **grades.js** : Configuration des notes et couleurs
- **tabs.js** : Configuration des onglets de navigation

### Utilitaires

- **shareUtils.js** : Fonctions de partage et copie dans le presse-papiers

## 🎨 Technologies

- **React 18** - Framework UI
- **Vite** - Build tool
- **Tailwind CSS** - Framework CSS
- **Lucide React** - Icônes

## 🔐 Authentification

TrustiScore utilise l'authentification par **code OTP à 6 chiffres** envoyé par email via [Brevo](https://www.brevo.com) — plus de mot de passe.

Détails complets (flow, sécurité, dépannage) : **[docs/guides/authentication.md](./docs/guides/authentication.md)**.

## 🗄️ Base de données

Le projet utilise **PostgreSQL** hébergé sur [Neon](https://neon.tech).

### Scripts disponibles

```bash
# Initialiser la base de données
npm run db:init

# Migrer vers PostgreSQL
npm run db:migrate-to-postgres

# Backup des données
npm run db:backup
```

### Documentation

- **[docs/guides/postgres-migration.md](./docs/guides/postgres-migration.md)** - Guide de migration vers PostgreSQL

## 📝 Bonnes Pratiques Implémentées

✅ Séparation des préoccupations (components, hooks, constants, utils)
✅ Composants réutilisables et modulaires
✅ Hooks personnalisés pour la logique métier
✅ Constantes centralisées
✅ Documentation JSDoc
✅ Structure de dossiers claire et scalable
✅ Nommage cohérent et explicite
✅ Authentification sécurisée par code OTP (Brevo)
✅ Base de données PostgreSQL avec Neon

## 🚢 Déploiement

L'application est déployée sur **Vercel**.

### Variables d'environnement requises

```env
DATABASE_URL=postgresql://...
BREVO_API_KEY=xkeysib-...
BREVO_FROM_EMAIL=noreply@votredomaine.com
BREVO_FROM_NAME=TrustiScore
FRONTEND_URL=https://votreapp.vercel.app
ADMIN_EMAIL=votre@email.com
NODE_ENV=production
```

Voir [.env.example](./.env.example) pour un modèle complet.

## 📚 Documentation

Toute la documentation détaillée (architecture, référence API, guides) vit
dans **[/docs](./docs/README.md)** :

- [Architecture](./docs/architecture/) — dont l'[app Android native](./docs/architecture/android-native-app-scan.md)
- [Référence API](./docs/api/README.md)
- [Guides](./docs/guides/) — déploiement, migration PostgreSQL, authentification, icônes
- [Legacy](./docs/legacy/) — documentation obsolète conservée pour l'historique
