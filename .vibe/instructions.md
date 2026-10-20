# Instructions pour Vibe Code - Projet Trusti

## 🎯 Contexte rapide

Trusti est un **comparateur d'applications privacy-first** qui évalue la souveraineté numérique des apps avec un système de notes **A-E** (A = Souverain & Privé, E = Critique).

**Architecture** : React 18 + Vite (frontend) | Express/Vercel Serverless (backend) | PostgreSQL via Neon (DB) | Capacitor 8 (Android)

**Déploiement** : Vercel (web) + GitHub Actions (APK Android)

---

## 📁 Structure du projet - Ce qu'il faut connaître

```
trusti/
├── src/                          # Code frontend React
│   ├── App.jsx                   # ⚠️ 631 LIGNES - Composant root, état global, routing tabs
│   ├── main.jsx                  # Point d'entrée React
│   ├── components/
│   │   ├── layout/               # Header, Navigation
│   │   ├── modals/               # 12 modaux (AppDetail, Login, Admin, Share...)
│   │   ├── ui/                   # ScoreIndicator, SearchBar, LoadingSpinner
│   │   ├── AppCard.jsx           # Carte d'application
│   │   ├── AppsList.jsx          # Grille + pagination
│   │   └── ...
│   ├── hooks/                    # useAppManagement, useAuth, useModals
│   ├── constants/                # appsData.js, grades.js, tabs.js, categories.js
│   ├── utils/                    # apiService.js, shareUtils.js
│   └── styles/
│       └── index.css             # Tailwind + styles globaux
│
├── api/                          # ✅ Routes serverless Vercel (PRODUCTION)
│   ├── apps.js                   # CRUD applications
│   ├── send-magic-link.js        # Auth email (Brevo)
│   ├── verify-token.js           # Validation token
│   ├── trusti-apps.js            # Apps grade A/B/C
│   └── star-apps.js              # Apps grade D/E
│
├── server/                       # Backend Express (DEV uniquement, port 3001)
│   ├── index.js                  # ⚠️ 740 LIGNES - À découper
│   └── database/
│       └── service-postgres.js   # Requêtes SQL Neon
│
├── android/                      # Projet Capacitor
│   ├── app/                      # Code natif Android
│   └── ...
│
├── docs/                         # Documentation complète
│   ├── README.md                 # Index de la documentation
│   ├── BACKLOG.md                # Roadmap et idées
│   ├── architecture/             # Analyse technique, Android, sécurité
│   ├── api/                      # Référence API
│   └── guides/                   # Déploiement, migration, icons, etc.
│
├── .claude/
│   └── context.md                # Contexte pour Claude Code
│
└── .github/workflows/            # CI/CD
    ├── android.yml               # Build APK
    ├── web-ci.yml                # Tests + build web
    ├── play-store-bundle.yml      # Bundle pour Play Store
    └── play-store-status.yml      # Statut publication
```

---

## 🚀 Commandes essentielles

### Développement
```bash
npm run dev              # Frontend seul (Vite, port 5173)
npm run server           # Backend seul (Express, port 3001)
npm run dev:all          # ⭐ Frontend + backend simultanément
npm run build           # Build Vite → /dist
npm run preview          # Prévisualisation du build
```

### Android (Capacitor)
```bash
npm run cap:sync         # ⭐ Build Vite + cap sync android (OBLIGATOIRE avant build Gradle)
npm run android:open     # Ouvre Android Studio
npm run android:generate-catalog  # Génère le catalogue pour AndroidManifest
```

### Base de données
```bash
# Note: Les scripts db:init et db:backup sont documentés mais pas dans package.json
# Voir docs/guides/postgres-migration.md pour la migration
```

### Tests
```bash
npm test                 # Tests unitaires (tests/technical/**/*.test.js)
```

### Déploiement
```bash
# Vercel déploie automatiquement main via GitHub integration
# Pour Android : push sur main/staging déclenche .github/workflows/android.yml
```

---

## ⚠️ PIÈGES À ÉVITER ABSOLUMENT

### 🔴 Critique - Ne JAMAIS faire
- **❌ Modifier `android/app/debug.keystore`** - Clé de signature debug, ne pas toucher
- **❌ Changer `appId` dans `capacitor.config.json`** - `eu.trusti.app` doit rester
- **❌ Supprimer ou modifier les workflows GitHub Actions** sans validation
- **❌ Pousser directement sur `main`** - Toujours via PR
- **❌ Force push sur main** - Interdit
- **❌ Modifier `API_KEY` ou `DATABASE_URL`** dans les fichiers (seulement via `.env`)

### 🟡 Attention - À faire avec précaution
- **⚠️ Ne pas dupliquer `API_URL`** - **TOUJOURS** utiliser `src/utils/apiConfig.js` (source unique de vérité)
  - Web prod : `/api` (same-origin Vercel)
  - Dev : `http://localhost:3001/api`
  - APK natif : `https://trusti-alpha.vercel.app/api` (URL absolue)
- **⚠️ Ne pas casser le build Capacitor** - `android/` dépend de `dist/` généré par Vite
- **⚠️ `App.jsx` est trop gros (631L)** - À découper avant d'y ajouter de la logique
- **⚠️ `server/index.js` est trop gros (740L)** - À découper en modules
- **⚠️ Les tokens magic link expirent en 15 min**

### 🟢 Bonnes pratiques
- **✅ Toujours valider les données** avant création d'application (voir `src/models/`)
- **✅ Utiliser `createApplication()`** plutôt que le constructeur direct
- **✅ Nettoyer les données** avec `sanitizeApplication()` avant validation
- **✅ Utiliser les constantes** `APP_CATEGORIES` et `TRUSTI_GRADES`
- **✅ Composants dans une liste** → Toujours `React.memo`
- **✅ Respecter le mobile-first** : max-width `max-w-md`, bottom nav fixe

---

## 🎯 Priorités de refactoring (Backlog technique)

Voir [docs/BACKLOG.md](../docs/BACKLOG.md) pour le détail.

### Urgent (À faire avant d'ajouter des features)
1. **Découper `src/App.jsx` (631L)** en hooks/custom components
   - Extraire la logique d'état global dans des hooks dédiés
   - Séparer le routing tabs en composants distincts
   - Créer des sous-composants pour chaque section

2. **Découper `server/index.js` (740L)** en modules
   - Séparer les routes par domaine
   - Extraire la logique métier dans des services
   - Créer des middlewares réutilisables

### Moyen terme
3. **Nettoyer les scripts racine** 
   - `test-*.js`, `fix-icons-*.js`, `check-*.js`, `*.log`, `*.txt`
   - Soit les déplacer dans `scripts/` avec une meilleure organisation
   - Soit les documenter et les intégrer dans `package.json`

4. **Synchroniser le README** 
   - Les scripts `db:init`, `db:backup` sont mentionnés mais pas dans `package.json`

5. **Vérifier la présence de `android/app/debug.keystore`** dans le dépôt

---

## 📝 Conventions du projet

### Nommage
| Type | Convention | Exemple |
|------|------------|---------|
| Composants | PascalCase | `AppCard.jsx`, `ScoreIndicator.jsx` |
| Hooks | `use` + PascalCase | `useAppManagement.js`, `useAuth.js` |
| Constantes | UPPER_SNAKE_CASE | `APP_CATEGORIES`, `TRUSTI_GRADES` |
| Variables | camelCase | `currentUser`, `appList` |
| Fonctions | camelCase | `getAppById()`, `filterByScore()` |

### Organisation des fichiers
- **Pas de CSS modules** : Uniquement Tailwind CSS + animations custom dans `index.css`
- **Pas de Redux** : React hooks + localStorage uniquement
- **Pas de router** : Navigation par `activeTab` state dans `App.jsx`
- **Hooks personnalisés** : Toujours dans `/hooks/` avec préfixe `use`
- **Constantes** : Toujours dans `/constants/`

### Style
- **Mobile-first** : Toujours penser mobile en premier
- **Tailwind** : Utiliser les classes Tailwind directement dans le JSX
- **Couleurs** : Utiliser les couleurs définies dans `src/constants/grades.js` pour les scores
- **Icônes** : Utiliser Lucide React (`import { IconName } from 'lucide-react'`)

---

## 🔍 Points d'entrée clés

### Pour comprendre l'application
1. **`src/App.jsx`** - Composant principal, contient toute la logique de routing et d'état
2. **`src/constants/appsData.js`** - Base de données des applications (à migrer vers PostgreSQL)
3. **`src/utils/apiConfig.js`** - Configuration centrale de l'URL de l'API
4. **`api/apps.js`** - Routes API pour la gestion des applications

### Pour comprendre l'authentification
- **Magic Link** : `api/send-magic-link.js` + `api/verify-token.js`
- **Stockage** : `localStorage` avec clés `trusti_current_user`, `trusti_onboarding_done`
- **Admin** : Protégé par PIN (localStorage), pas de rôle serveur

### Pour comprendre Android
- **`capacitor.config.json`** - Configuration Capacitor
- **`android/`** - Projet natif généré par Capacitor
- **`assets/`** (racine) - Sources pour les icônes Android (générées via `@capacitor/assets`)
- **Note** : L'APK n'est pas hors-ligne, il dépend du backend Vercel en production

---

## 💡 Conseils pour travailler efficacement

### Avant de commencer une tâche
1. **Lire le fichier concerné** et comprendre son rôle
2. **Vérifier les dépendances** dans `package.json`
3. **Chercher des exemples** dans le code existant
4. **Vérifier la documentation** dans `docs/`

### Avant de commiter
1. **Exécuter `npm test`** - Tous les tests doivent passer
2. **Exécuter `npm run build`** - Le build doit fonctionner
3. **Si changement frontend** : Tester `npm run cap:sync`
4. **Vérifier les conventions** de nommage et d'organisation

### Pour les changements importants
1. **Créer une branche** : `git checkout -b feature/nom-de-la-feature` ou `fix/nom-du-bug`
2. **Faire des commits atomiques** : Un commit = une seule chose
3. **Écrire des messages de commit clairs** : `[type] description` (ex: `feat: add search filter`)
4. **Ouvrir une PR** avec une description détaillée

---

## 📚 Documentation utile

- **[README principal](../README.md)** - Présentation, structure, déploiement
- **[docs/README.md](../docs/README.md)** - Index de la documentation
- **[docs/BACKLOG.md](../docs/BACKLOG.md)** - Roadmap et idées de features
- **[docs/architecture/technical-analysis.md](../docs/architecture/technical-analysis.md)** - Analyse technique
- **[docs/api/README.md](../docs/api/README.md)** - Référence API complète
- **[.claude/context.md](../.claude/context.md)** - Contexte pour Claude Code

---

## 🆘 Besoin d'aide ?

Si tu es bloqué ou que quelque chose n'est pas clair :

1. **Cherche dans le code** - La plupart des réponses y sont
2. **Regarde dans `docs/`** - La documentation est très complète
3. **Vérifie `.claude/context.md`** - Contexte détaillé pour les agents IA
4. **Demande à l'utilisateur** - Si vraiment nécessaire

---

*Dernière mise à jour : [Date de création]*
*Fichier : `.vibe/instructions.md`*
