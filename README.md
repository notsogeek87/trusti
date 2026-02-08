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
- **UI** : TrustiLogo, ScoreIndicator, SearchBar
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

TrustiScore utilise l'authentification par **Magic Link** avec [Resend](https://resend.com). Les utilisateurs reçoivent un lien sécurisé par email pour se connecter sans mot de passe.

### Configuration rapide

```bash
# Vérifier votre configuration actuelle
npm run check:resend

# Tester l'envoi à un email
npm run test:email votre@email.com
```

### 📚 Guides de configuration

- **[RESEND_ADD_EMAIL.md](./RESEND_ADD_EMAIL.md)** - Guide étape par étape pour ajouter des emails vérifiés
- **[RESEND_CONFIGURATION.md](./RESEND_CONFIGURATION.md)** - Configuration complète pour dev et production
- **[MAGIC_LINK_SETUP.md](./MAGIC_LINK_SETUP.md)** - Détails techniques de l'implémentation

### Configuration en mode développement

En mode sandbox, vous devez vérifier les emails dans Resend :

1. Allez sur https://resend.com/settings
2. Trouvez "Verified emails" ou "Domains" → `onboarding@resend.dev`
3. Ajoutez et vérifiez vos emails de test
4. Voir le guide complet : [RESEND_ADD_EMAIL.md](./RESEND_ADD_EMAIL.md)

### Configuration pour la production

Pour envoyer à n'importe quel email, vérifiez votre domaine :

1. Ajoutez votre domaine dans Resend
2. Configurez les enregistrements DNS (SPF, DKIM)
3. Mettez à jour `.env` avec votre domaine
4. Voir le guide complet : [RESEND_CONFIGURATION.md](./RESEND_CONFIGURATION.md)

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

- **[POSTGRES_MIGRATION.md](./POSTGRES_MIGRATION.md)** - Guide de migration vers PostgreSQL

## 📝 Bonnes Pratiques Implémentées

✅ Séparation des préoccupations (components, hooks, constants, utils)
✅ Composants réutilisables et modulaires
✅ Hooks personnalisés pour la logique métier
✅ Constantes centralisées
✅ Documentation JSDoc
✅ Structure de dossiers claire et scalable
✅ Nommage cohérent et explicite
✅ Authentification sécurisée par Magic Link
✅ Base de données PostgreSQL avec Neon

## 🚢 Déploiement

L'application est déployée sur **Vercel**.

### Variables d'environnement requises

```env
DATABASE_URL=postgresql://...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=TrustiScore <noreply@votredomaine.com>
FRONTEND_URL=https://votreapp.vercel.app
NODE_ENV=production
```

Voir [.env.example](./.env.example) pour un modèle complet.
