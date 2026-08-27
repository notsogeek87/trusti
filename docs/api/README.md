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
  exigent soit l'en-tête `x-api-key` égal à `process.env.API_KEY` (automations
  externes type n8n), soit `Authorization: Bearer <jeton admin>` valide (voir
  [../guides/authentication.md](../guides/authentication.md)). Vérification
  faite par `isAuthorizedAdminRequest` (`server/adminToken.js`) — ni `Origin`
  ni `Referer` ne sont utilisés comme preuve d'identité (falsifiables par tout
  client non-navigateur).
- **GET** `?type=trusti|star`, plus filtres optionnels : `limit`, `offset`,
  `page`, `search`/`q`, `sortBy`, `awards`, `showInAwards`, `onboarding`,
  `categories`, `ids`, `grade`, `alternatives_for`.
- **POST / PUT / DELETE** : création, mise à jour, suppression d'une
  application (réservé aux clients authentifiés).

### `GET/POST/PUT/DELETE /api/custom-trusti-apps` — `api/custom-trusti-apps.js`

Gestion des « Custom Trusti Apps » (apps notées A/B/C par l'équipe Trusti,
utilisées par l'interface admin `/admin`). Même règle d'auth que `/api/apps` :
mutations réservées à `x-api-key` ou jeton admin.

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
protégé par la même auth que les mutations de `/api/apps` (`x-api-key` ou
jeton admin), y compris pour `list`.

## Authentification

Voir le guide dédié : [../guides/authentication.md](../guides/authentication.md)
pour le flow complet (OTP par email via Brevo).

### `POST /api/send-otp` — `api/send-otp.js`

Génère un code à 6 chiffres, le stocke dans la table `magic_link_tokens`
(nom historique, conservé pour ne pas casser le schéma existant) et
l'envoie par email via Brevo. Rate-limit : 3 envois / 5 min / email.
En l'absence de `BREVO_API_KEY` (dev local), le code est loggé en console
au lieu d'être envoyé.

### `POST /api/verify-otp` — `api/verify-otp.js`

Vérifie le couple `(email, code)` pour la connexion utilisateur standard.
Rate-limit anti-bruteforce persistant en base (table `otp_attempts`, voir
`server/otpRateLimit.js`) : 5 tentatives échouées → verrouillage 15 min pour
cet email. Ne délivre aucun jeton (session gérée côté client par `useAuth`).

### `POST /api/admin-auth` — `api/admin-auth.js`

Même mécanisme OTP que `send-otp` (y compris le rate-limit d'envoi), restreint
à `process.env.ADMIN_EMAIL` (bypass si la variable n'est pas définie, pratique
en dev). Envoie le code que l'admin doit soumettre à `verify-admin-otp`.

### `POST /api/verify-admin-otp` — `api/verify-admin-otp.js`

Vérifie le couple `(email, code)` émis par `admin-auth` et, si valide, émet un
**jeton de session admin** signé (HMAC, `server/adminToken.js`, 12h de durée
de vie, `ADMIN_SESSION_SECRET`). Ce jeton est stocké côté client
(`src/utils/adminAuth.js`) et envoyé en `Authorization: Bearer` sur chaque
mutation admin (`adminFetch`). Même rate-limit anti-bruteforce que
`verify-otp`.

### `GET /api/check-admin` — `api/check-admin.js`

Indique si un email correspond à `ADMIN_EMAIL` (ou tout email si la variable
n'est pas définie). Sert uniquement à décider d'afficher l'entrée « Admin »
dans l'UI — ne prouve rien et n'autorise aucune action seule.

## Notes

- Toutes les fonctions gèrent CORS elles-mêmes (`Access-Control-Allow-*` +
  réponse `200` sur `OPTIONS`) — il n'y a pas de middleware CORS partagé.
- En développement, un serveur Express équivalent existe dans
  `server/index.js` (`npm run server`) pour ne pas dépendre des fonctions
  serverless Vercel en local.
