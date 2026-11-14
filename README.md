# Trusti

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
├── constants/           # Constantes (catégories, notes A-E, onglets…)
├── hooks/               # Hooks React personnalisés (état de l'app, voir ci-dessous)
├── utils/               # Fonctions utilitaires, pures et testées quand c'est possible
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
- **Features** : AppCard, AppsList, ExplainerPanel, ShareButton, DataHygieneCard (hygiène numérique, voir [le guide](./docs/guides/hygiene-numerique.md))

### Hooks Personnalisés

`App.jsx` ne fait qu'assembler l'état et choisir l'écran affiché ; la logique vit dans les hooks :

- **useAppManagement** : onglet actif, recherche et listes d'apps ; assemble `useUserSelections`
  (choix sauvegardés en local), `useCatalogApps` (catalogue paginé) et `useRemoteAppLists`
  (palmarès, « Mes Apps », recherche). La liste affichée est calculée dans `utils/appListing.js`.
- **useOnboardingFlow** : bienvenue, sélection des apps, re-scan et propositions de re-scan
- **useMyAppsView** : tri et filtres de « Mes Apps » (logique pure dans `utils/myAppsFilters.js`)
- **useAppDetail**, **useShareLinks**, **useBackNavigation** : fiche d'une app, liens de partage, bouton retour
- **useModals** : ouverture/fermeture des modales

### Constantes

- **categories.js** : Catégories du catalogue
- **grades.js** : Configuration des notes et couleurs
- **tabs.js** : Configuration des onglets de navigation

### Utilitaires

- **shareUtils.js** : Fonctions de partage et copie dans le presse-papiers

## 🎨 Technologies

- **React 18** - Framework UI
- **Vite** - Build tool
- **Tailwind CSS** - Framework CSS
- **Lucide React** - Icônes

## 🔐 Pas de compte, pas d'administration

Trusti n'a **ni connexion ni interface d'administration** : les choix de l'utilisateur
restent sur son appareil (localStorage). Le catalogue d'apps n'est modifiable que par
des appels serveur à serveur portant l'en-tête `x-api-key` (variable `API_KEY`), par
exemple depuis n8n. Sans `API_KEY`, toute écriture est refusée.

## 🗄️ Base de données

Le projet utilise **PostgreSQL**, hébergé chez **Hyperfluid** depuis le 13 novembre 2026
(auparavant Neon : voir [docs/legacy/](./docs/legacy/)). N'importe quel PostgreSQL
convient : il suffit de renseigner `DATABASE_URL`.

### Scripts disponibles

```bash
# Créer les tables et index
npm run db:init

# Fiabiliser nom, icône et URL Play Store de toutes les apps (--dry-run pour simuler)
npm run db:backfill-playstore -- --dry-run
```

Côté serveur, `server/database/service-postgres.js` est la porte d'entrée unique des routes
`api/*.js` ; les requêtes sont rangées par domaine dans `server/database/postgres/`.

### Documentation


## 📝 Bonnes Pratiques Implémentées

✅ Séparation des préoccupations (components, hooks, constants, utils)
✅ Composants réutilisables et modulaires
✅ Hooks personnalisés pour la logique métier
✅ Constantes centralisées
✅ Documentation JSDoc
✅ Structure de dossiers claire et scalable
✅ Nommage cohérent et explicite
✅ Écritures de l'API protégées par clé (`x-api-key`), sans compte utilisateur
✅ Base de données PostgreSQL (hébergée chez Hyperfluid)

## 🚢 Déploiement

L'application (site web + API) est déployée sur **Hyperfluid** : le workflow
`.github/workflows/hyperfluid-image.yml` publie l'image Docker sur ghcr.io à
chaque push sur `main`, et Hyperfluid la redéploie (voir `hyperfluid.toml`).

Un projet Vercel (`trusti-alpha.vercel.app`) est conservé **temporairement** : il ne fait que relayer `/api/*` vers Hyperfluid (`vercel.json`, `.vercelignore`) pour les anciennes versions de l'APK. À supprimer quand elles auront disparu.

### Variables d'environnement requises

```env
DATABASE_URL=postgresql://...
FRONTEND_URL=https://app.trusti-score.eu
API_KEY=cle-pour-les-integrations-externes
NODE_ENV=production
```

`API_KEY` est la clé attendue dans l'en-tête `x-api-key` pour toute
modification du catalogue d'apps via l'API depuis un outil externe (n8n,
etc.). Elle **doit** être une valeur aléatoire longue en production
(`openssl rand -hex 32`).

Voir [.env.example](./.env.example) pour un modèle.

### Auto-hébergement complet

Faire tourner la totalité de la pile (web + API + app Android) demande donc
deux services externes, tous requis :

- une base **PostgreSQL** (`DATABASE_URL`), quel que soit l'hébergeur ;
- un serveur Node exécutant l'image Docker (`Dockerfile`, `server/production.js`)
  et exposant ces routes à l'URL renseignée dans
  `src/utils/apiConfig.js` (voir section Android ci-dessous).

Sans ces deux éléments en place, ni le site web ni l'app Android ne peuvent
afficher de données réelles (recherche, notes, comparaisons) : il n'y a pas
de mode hors-ligne avec données locales.

## 📱 Application Android (Capacitor)

L'APK (`android/`, package `eu.trusti.app`) est un **wrapper Capacitor** du
même build web (`dist/`, généré par `npm run cap:sync`) : voir
[docs/architecture/android-native-app-scan.md](./docs/architecture/android-native-app-scan.md)
pour le détail de la couche native (scan des apps installées) et le workflow
de développement (`npm run cap:sync`, `npm run android:open`).

**⚠️ Ce n'est pas une app hors-ligne.** Le bundle embarqué dans l'APK ne
contient aucune donnée : au runtime, la WebView interroge directement le
backend de production (`https://api.trusti-score.eu/api`, codé en
dur dans `src/utils/apiConfig.js` pour la cible native), lui-même dépendant
de la base PostgreSQL hébergée chez Hyperfluid. L'app ne fonctionne donc pleinement
que tant que ce backend, non open et centralisé, reste disponible.

### Permissions déclarées (`AndroidManifest.xml`)

- `INTERNET` — requis pour tous les appels à l'API ci-dessus.
- `REQUEST_DELETE_PACKAGES` — permission "normale" (aucune invite), utilisée
  pour proposer la désinstallation d'une autre app depuis l'écran de détail.
- `REQUEST_INSTALL_PACKAGES` — ajoutée par l'updater, **uniquement dans les
  APK des releases GitHub** (retirée du build Play Store) : permet d'installer
  les mises à jour. Voir [docs/guides/android-auto-update.md](./docs/guides/android-auto-update.md).
- `<queries>` sur une liste explicite de package names (générée par
  `npm run android:generate-catalog`) — permet de détecter quelles apps du
  catalogue Trusti sont installées, sans la permission restreinte
  `QUERY_ALL_PACKAGES`.

### Build et publication de l'APK

`.github/workflows/android.yml` construit l'APK à chaque push sur `main`/
`staging` (et sur PR/`workflow_dispatch`, sans publication) :

- `versionCode` = `github.run_number` et `versionName` = `<appVersionBase>.<run_number>`
  (`appVersionBase` dans `android/gradle.properties`, ex. `1.0.152`), donc
  strictement croissants d'un run à l'autre — voir
  [android/app/build.gradle](./android/app/build.gradle) et
  [docs/guides/android-auto-update.md](./docs/guides/android-auto-update.md).
- Sur `main`, chaque run publie une **release GitHub permanente** (jamais
  écrasée), taguée `v1.0.<run_number>`, avec l'APK en asset
  (`Trusti-1.0.<run_number>.apk`).
- Sur les autres branches/PR, la release est un pré-release `debug-<branche>`,
  écrasée à chaque run — non destinée à une distribution externe.
- **Mises à jour automatiques** : les APK des releases GitHub vérifient et
  proposent les nouvelles versions à chaque ouverture (désactivé dans le build
  Play Store) — voir [le guide](./docs/guides/android-auto-update.md).
- **Signature** : uniquement la clé debug committée
  (`android/app/debug.keystore`, mot de passe standard `android`). Aucune clé
  de production n'est configurée à ce jour — voir « Risqué, non touché » dans
  l'audit de soumission Izzy pour les implications.

## 📚 Documentation

Toute la documentation détaillée (architecture, référence API, guides) vit
dans **[/docs](./docs/README.md)** :

- [Architecture](./docs/architecture/) — dont l'[app Android native](./docs/architecture/android-native-app-scan.md)
- [Référence API](./docs/api/README.md)
- [Guides](./docs/guides/) — déploiement, migration PostgreSQL, authentification, icônes, Play Store, mises à jour Android
- [Legacy](./docs/legacy/) — documentation obsolète conservée pour l'historique

## Licence

GNU General Public License v3.0 (GPL-3.0) — voir [`LICENSE`](LICENSE).
