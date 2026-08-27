# TrustiScore — Contexte projet

Comparateur d'applications privacy-first. Évalue la souveraineté numérique des apps (notes A→E) et propose des alternatives européennes.

## Stack

| Couche | Techno | Version |
|--------|--------|---------|
| Frontend | React + Vite | 18.2 / 5.2 |
| Styling | Tailwind CSS | 3.4 |
| Icônes | Lucide React | 0.344 |
| Backend dev | Express | 5.2 |
| Backend prod | Vercel serverless (`/api/`) | — |
| Base de données | PostgreSQL via Neon | — |
| Email | Brevo (principal) + Resend (backup) | — |
| Déploiement | Vercel → branch `main` | — |
| Android | Capacitor (wrap du build Vite) | 8.x |

## Commandes

```bash
npm run dev:all      # Frontend (5173) + backend (3001) simultanément
npm run build        # Build Vite → /dist
npm run vercel-build # Build production Vercel
npm run cap:sync     # Build Vite puis cap sync android (avant tout build Gradle)
```

## Architecture

```
src/
├── App.jsx                    # Composant root (631L) — état global, routing tabs
├── main.jsx                   # Point d'entrée React
├── components/
│   ├── layout/
│   │   ├── Header.jsx         # Logo, login/logout, bouton admin
│   │   └── Navigation.jsx     # Bottom nav (3 tabs)
│   ├── modals/                # 12 modaux (AppDetail, Login, Admin, Share...)
│   ├── ui/
│   │   ├── ScoreIndicator.jsx # Barre A→E + badge large
│   │   ├── SearchBar.jsx
│   │   └── LoadingSpinner.jsx
│   ├── AppCard.jsx            # Carte app dans la liste
│   ├── AppsList.jsx           # Grille apps + pagination
│   ├── LandingPage.jsx        # Intro plein écran (1ère visite ou bouton ?)
│   └── OnboardingApps.jsx     # Sélection apps 1ère visite
├── hooks/
│   ├── useAppManagement.js    # État global apps, filtres, pagination
│   ├── useAuth.js             # Auth + localStorage
│   └── useModals.js           # États des modaux
├── constants/
│   ├── tabs.js                # TABS.APPLICATIONS | MY_APPS | TOP_ALTERNATIVES
│   ├── grades.js              # GRADES, GRADE_COLORS, GRADE_INFO (A→E)
│   └── categories.js          # 18 catégories + CATEGORY_MAPPING
└── utils/
    ├── apiService.js
    └── shareUtils.js

api/                           # Vercel serverless (production)
├── apps.js                    # CRUD apps
├── send-magic-link.js         # Auth email Brevo
├── verify-token.js            # Validation token
├── trusti-apps.js             # Apps grade A/B/C
└── star-apps.js               # Apps grade D/E

server/
├── index.js                   # Express dev (port 3001, 740L)
└── database/
    └── service-postgres.js    # Requêtes SQL Neon
```

## Variables d'environnement (.env)

```env
DATABASE_URL=postgresql://...@neon.tech/...?sslmode=require
BREVO_API_KEY=...
BREVO_FROM_EMAIL=noreply@...
FRONTEND_URL=https://trusti.vercel.app
NODE_ENV=development
```

## Navigation (3 onglets)

```
APPLICATIONS      → Catalogue apps populaires, filtre catégorie + recherche
MY_APPS           → Apps sélectionnées par l'user, suivi migrations
TOP_ALTERNATIVES  → Awards (apps avec show_in_awards=1)
```

## Authentification (Magic Link)

1. `POST /api/send-magic-link` → Brevo envoie email avec lien `FRONTEND_URL?token=xxx`
2. `VerifyAuth` détecte `?token` dans l'URL
3. `GET /api/verify-token` → valide (15 min d'expiration)
4. `localStorage.setItem('trusti_current_user', { email, loginAt })`

## Persistance localStorage

```
trusti_current_user              → { email, loginAt }
trusti_{email}_apps              → { myApps: Set, migratedApps: Set, customMigrations: Map }
trusti_{email}_admin_unlocked    → true/false (PIN admin)
```

## Grades

| Grade | Label | Couleur hex |
|-------|-------|-------------|
| A | Souverain & Privé | `#006837` |
| B | Sécurisé | `#8dc63f` |
| C | Usage Hybride | `#fbb03b` |
| D | Risque élevé | `#f7931e` |
| E | Critique | `#c1272d` |

`GRADE_INFO` dans `src/constants/grades.js` → title + description pour chaque note.

## Relations entre apps

- `alternativeAppIds[]` — apps alternatives recommandées (meilleur score)
- `replacesAppIds[]` — apps remplacées par celle-ci
- Bidirectionnelles, chargées dynamiquement dans `AppDetailModal`

## Conventions

- **Composants** : PascalCase, Tailwind pur, mémoïsés si dans une liste (`React.memo`)
- **Hooks** : préfixe `use`, custom hooks dans `/hooks/`
- **Constantes** : UPPER_SNAKE_CASE dans `/constants/`
- **API_URL** : centralisé dans `src/utils/apiConfig.js` (unique source de vérité,
  ne pas redéclarer ailleurs) — `/api` en web prod (same-origin Vercel),
  `http://localhost:3001/api` en dev, et une URL **absolue**
  (`https://trusti-alpha.vercel.app/api`) dès que `Capacitor.isNativePlatform()`
  est vrai (APK), puisque le paquet natif n'a aucun backend co-localisé
- **Pas de router** : navigation par `activeTab` state dans `App.jsx`
- **Mobile-first** : max-width `max-w-md`, bottom nav fixe, `scrollbar-hide`
- **Pas de CSS modules** : uniquement Tailwind + animations custom dans `index.css`
- **Pas de Redux** : React hooks + localStorage uniquement

## Points d'attention

- Le bouton reset données (`RotateCcw` dans Header) est visible uniquement si connecté
- L'admin est protégé par PIN (localStorage), pas de rôle serveur
- Les tokens magic link expirent en 15 min
- `App.jsx` est le fichier le plus complexe (631L) — éviter d'y ajouter de la logique, préférer des hooks

## Android / APK (Capacitor)

Trusti est une SPA Vite classique — c'est le cas d'usage le plus simple pour
Capacitor : `webDir` pointe directement sur `dist/`, pas de mirroir à
régénérer à la main.

- `capacitor.config.json` : `appId com.trusti.app`, `webDir: "dist"`.
- `android/` : projet natif généré par `npx cap add android`. Aucune
  personnalisation Java/Kotlin — `MainActivity` reste la sous-classe
  `BridgeActivity` par défaut, pas de plugin natif custom (contrairement à un
  projet qui aurait besoin d'un lecteur intégré ou d'un bridge spécifique).
- `assets/` (racine du repo, hors `public/`) : sources carrées utilisées par
  `@capacitor/assets` (`icon.png`, `icon-foreground.png`,
  `icon-background.png`) pour régénérer les icônes Android et l'écran de
  démarrage — `npx capacitor-assets generate --android`. Ne pas confondre
  avec `public/assets/` (assets web historiques, logo portrait non carré).
- `npm run cap:sync` = `vite build && npx cap sync android`, à lancer avant
  tout build Gradle (sinon `android/` contient encore le build précédent).
- Compiler l'APK réclame le SDK Android (absent de cet environnement de dev
  Claude — `dl.google.com` est bloqué) : `cd android && ./gradlew
  assembleDebug`. C'est `.github/workflows/android.yml` qui le fait en CI à
  chaque push sur `main`/`staging`/PR — pas encore de build signé (à ajouter
  plus tard via des secrets keystore le jour où une vraie release est
  prévue).
- **Récupérer le dernier APK** : les artifacts d'Actions (Azure Blob Storage)
  sont bloqués par certaines politiques réseau restrictives — la CI publie
  donc aussi l'APK en **release GitHub**, taguée par branche
  (`debug-main`, `debug-staging`, `debug-<branche-de-PR>`, slash remplacé par
  un tiret) pour qu'un build sur une branche n'écrase pas celui d'une autre.
  Toujours à `github.com/notsogeek87/trusti/releases/tag/debug-<branche>`.
- **Limite connue, non résolue dans cette passe** : le flux de connexion par
  lien magique (email → `?token=` → `VerifyAuth.jsx`) ouvre le navigateur du
  téléphone, pas l'APK (aucun deep link configuré). Le flux OTP (code saisi à
  la main, `LoginModal`/`PinModal`) fonctionne nativement sans rien changer —
  c'est celui à privilégier dans l'app installée.

## Workflow git

- Branche de dev : `claude/website-design-ux-review-HLt8T`
- Production : `main` → Vercel autodeploy
- Toujours merger sur `main` après validation
