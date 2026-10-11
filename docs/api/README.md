# Référence API

Pour qui / Pourquoi : point d'entrée pour tout développeur qui doit consommer
ou modifier une route serverless Vercel du projet. Les fonctions vivent dans
`api/` (une fonction = un fichier = une route, convention Vercel) et
s'appuient sur `server/database/service-postgres.js` pour l'accès aux
données. Aucun routage custom : `vercel.json` ne fait que pointer
`buildCommand`/`outputDirectory`, donc `api/apps.js` sert automatiquement
`/api/apps`, etc.

En local, ces mêmes fonctions ne tournent pas nativement — voir
`npm run server` / `npm run dev:all` dans [../guides/deployment.md](../guides/deployment.md).

## Apps

### `GET/POST/PUT/DELETE /api/apps` — `api/apps.js`

Endpoint principal, backé par PostgreSQL (`service-postgres.js`).

- **Auth** : `GET` est public (catalogue en lecture). `POST`/`PUT`/`DELETE`
  exigent l'en-tête `x-api-key` égal à `process.env.API_KEY` (automations
  externes type n8n ; il n'y a plus de connexion ni d'interface admin). Vérification
  faite par `isAuthorizedAdminRequest` (`server/adminToken.js`) — ni `Origin`
  ni `Referer` ne sont utilisés comme preuve d'identité (falsifiables par tout
  client non-navigateur).
- **GET** `?type=trusti|star`, plus filtres optionnels : `limit`, `offset`,
  `page`, `search`/`q`, `sortBy`, `awards`, `showInAwards`, `onboarding`,
  `categories`, `ids`, `grade`, `alternatives_for`.
- **GET** `?assessment_for=:id` : détail de l'évaluation TrustiScore d'une app,
  lu dans la table `app_assessments` (alimentée depuis le dépôt `trustillm`,
  schéma dans `trustillm/migrations/001_app_assessments.sql`). Réponse :
  `{ success: true, assessment }`, avec `assessment = null` si l'app n'a pas
  été évaluée ou si la table n'existe pas encore. `assessment` contient `grade`,
  `score`, `scoreRange`, `computedGrade`, `overridden`, `provisional`,
  `hasUnverifiedSources`, `assessedAt`, `summary` et `criteria[]` (par critère :
  `name`, `points`, `levelTitle`, `levelDescription`, `confidence`, `rationale`,
  `provisional`, `sources[]` avec `toConfirm` pour les sources non vérifiées).
  Mise en forme : `server/assessment.js`. Affiché par
  `src/components/assessment/AssessmentDetail.jsx` dans la fiche d'une app
  (masqué en mode enfant pour l'instant) ; sans connexion ou sans évaluation, la
  fiche garde le texte court `reason`.
- **POST / PUT / DELETE** : création, mise à jour, suppression d'une
  application (réservé aux clients authentifiés).

### `GET/POST/PUT/DELETE /api/custom-trusti-apps` — `api/custom-trusti-apps.js`

Gestion des « Custom Trusti Apps » (apps notées A/B/C par l'équipe Trusti,
gérées uniquement par API). Même règle d'auth que `/api/apps` :
mutations réservées à `x-api-key`.

### `GET/POST/PUT/DELETE /api/star-apps` — `api/star-apps.js`

Même contrat CRUD que `custom-trusti-apps`, pour les « Star Apps »
(apps grand public notées D/E, généralement les alternatives à remplacer).
Même règle d'auth (mutations protégées).

### `GET /api/top-apps` — `api/top-apps.js`

Interroge le Google Play Store via `google-play-scraper` (top charts) et
enrichit chaque résultat avec catégorie/couleur/icône pour l'admin.

### `GET /api/trusti-apps` — `api/trusti-apps.js`

Sert la liste d'applications recommandées issue de
[siksik.org](https://siksik.org/applications-alternatives-pour-android-plus-respectueuses-de-la-vie-privee/),
avec résolution d'icônes (cache + F-Droid + Play Store).
Voir aussi l'audit [../legacy/donnees-en-dur-audit.md](../legacy/donnees-en-dur-audit.md)
qui documente pourquoi cette liste est encore codée en dur plutôt qu'en base.

### `GET /api/clean-duplicates?action=list|delete` — `api/clean-duplicates.js`

Utilitaire de maintenance : détecte (`list`) ou supprime (`delete`) les
doublons d'applications en base. Jamais appelé par le front — entièrement
protégé par la même auth que les mutations de `/api/apps` (`x-api-key`), y compris pour `list`.

## Authentification

Il n'y a ni connexion utilisateur ni interface d'administration. Les routes qui
modifient le catalogue (`POST`/`PUT`/`DELETE` sur `/api/apps`, `/api/star-apps`,
`/api/custom-trusti-apps`, ainsi que `/api/clean-duplicates` et
`/api/lookup-playstore`) exigent l'en-tête `x-api-key` égal à `API_KEY`
(comparaison en temps constant, `server/adminToken.js`). Sans `API_KEY`
configurée, elles répondent `401`. Les `GET` du catalogue restent publics.

## Notes

- Toutes les fonctions gèrent CORS elles-mêmes (`Access-Control-Allow-*` +
  réponse `200` sur `OPTIONS`) — il n'y a pas de middleware CORS partagé.
- En développement, un serveur Express équivalent existe dans
  `server/index.js` (`npm run server`) pour ne pas dépendre des fonctions
  serverless Vercel en local.
