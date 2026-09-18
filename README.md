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
ADMIN_SESSION_SECRET=valeur-aleatoire-longue
API_KEY=cle-pour-les-integrations-externes
NODE_ENV=production
```

`ADMIN_SESSION_SECRET` signe les jetons de session admin après vérification
OTP et **doit** être une valeur aléatoire en production (`openssl rand -hex
32`). `API_KEY` est la clé attendue dans l'en-tête `x-api-key` pour toute
modification du catalogue d'apps via l'API depuis un outil externe (n8n,
etc.), hors navigateur admin.

Voir [.env.example](./.env.example) pour un modèle complet, y compris la
configuration Resend historique (optionnelle).

### Auto-hébergement complet

Faire tourner la totalité de la pile (web + API + app Android) demande donc
trois services externes, tous requis :

- une base **PostgreSQL** sur [Neon](https://neon.tech) (`DATABASE_URL`) ;
- un compte **[Brevo](https://www.brevo.com)** pour l'envoi des codes OTP
  (`BREVO_API_KEY`) — voir [docs/guides/authentication.md](./docs/guides/authentication.md) ;
- un déploiement **Vercel** (ou équivalent Node compatible avec `api/` et
  `server/`) exposant ces routes à l'URL renseignée dans
  `src/utils/apiConfig.js` (voir section Android ci-dessous).

Sans ces trois éléments en place, ni le site web ni l'app Android ne peuvent
afficher de données réelles (recherche, notes, comparaisons) : il n'y a pas
de mode hors-ligne avec données locales.

## 📱 Application Android (Capacitor)

L'APK (`android/`, package `com.trusti.app`) est un **wrapper Capacitor** du
même build web (`dist/`, généré par `npm run cap:sync`) : voir
[docs/architecture/android-native-app-scan.md](./docs/architecture/android-native-app-scan.md)
pour le détail de la couche native (scan des apps installées) et le workflow
de développement (`npm run cap:sync`, `npm run android:open`).

**⚠️ Ce n'est pas une app hors-ligne.** Le bundle embarqué dans l'APK ne
contient aucune donnée : au runtime, la WebView interroge directement le
backend Vercel de production (`https://trusti-alpha.vercel.app/api`, codé en
dur dans `src/utils/apiConfig.js` pour la cible native), lui-même dépendant
de Neon (PostgreSQL) et Brevo (emails). L'app ne fonctionne donc pleinement
que tant que ce backend, non open et centralisé, reste disponible.

### Permissions déclarées (`AndroidManifest.xml`)

- `INTERNET` — requis pour tous les appels à l'API ci-dessus.
- `REQUEST_DELETE_PACKAGES` — permission "normale" (aucune invite), utilisée
  pour proposer la désinstallation d'une autre app depuis l'écran de détail.
- `<queries>` sur une liste explicite de package names (générée par
  `npm run android:generate-catalog`) — permet de détecter quelles apps du
  catalogue Trusti sont installées, sans la permission restreinte
  `QUERY_ALL_PACKAGES`.

### Build et publication de l'APK

`.github/workflows/android.yml` construit l'APK à chaque push sur `main`/
`staging` (et sur PR/`workflow_dispatch`, sans publication) :

- `versionCode`/`versionName` sont injectés par la CI depuis
  `${{ github.run_number }}` (`-PtrustiVersionCode=… -PtrustiVersionName=1.0.<run>`),
  donc strictement croissants d'un run à l'autre — voir les commentaires dans
  [android/app/build.gradle](./android/app/build.gradle).
- Sur `main`, chaque run publie une **release GitHub permanente** (jamais
  écrasée), taguée `v1.0.<run_number>`, avec l'APK en asset
  (`TrustiScore-1.0.<run_number>.apk`).
- Sur les autres branches/PR, la release est un pré-release `debug-<branche>`,
  écrasée à chaque run — non destinée à une distribution externe.
- **Signature** : uniquement la clé debug committée
  (`android/app/debug.keystore`, mot de passe standard `android`). Aucune clé
  de production n'est configurée à ce jour — voir « Risqué, non touché » dans
  l'audit de soumission Izzy pour les implications.

## 📚 Documentation

Toute la documentation détaillée (architecture, référence API, guides) vit
dans **[/docs](./docs/README.md)** :

- [Architecture](./docs/architecture/) — dont l'[app Android native](./docs/architecture/android-native-app-scan.md)
- [Référence API](./docs/api/README.md)
- [Guides](./docs/guides/) — déploiement, migration PostgreSQL, authentification, icônes
- [Legacy](./docs/legacy/) — documentation obsolète conservée pour l'historique

## Licence

GNU General Public License v3.0 (GPL-3.0) — voir [`LICENSE`](LICENSE).
