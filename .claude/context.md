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

## Commandes

```bash
npm run dev:all      # Frontend (5173) + backend (3001) simultanément
npm run build        # Build Vite → /dist
npm run vercel-build # Build production Vercel
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
- **API_URL** : auto-détecté (`/api` en prod, `http://localhost:3001/api` en dev)
- **Pas de router** : navigation par `activeTab` state dans `App.jsx`
- **Mobile-first** : max-width `max-w-md`, bottom nav fixe, `scrollbar-hide`
- **Pas de CSS modules** : uniquement Tailwind + animations custom dans `index.css`
- **Pas de Redux** : React hooks + localStorage uniquement

## Points d'attention

- Le bouton reset données (`RotateCcw` dans Header) est visible uniquement si connecté
- L'admin est protégé par PIN (localStorage), pas de rôle serveur
- Les tokens magic link expirent en 15 min
- `App.jsx` est le fichier le plus complexe (631L) — éviter d'y ajouter de la logique, préférer des hooks

## Workflow git

- Branche de dev : `claude/website-design-ux-review-HLt8T`
- Production : `main` → Vercel autodeploy
- Toujours merger sur `main` après validation
