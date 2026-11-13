# Déploiement sur Hyperfluid

Le site web et l'API de Trusti tournent dans une seule image Docker, exécutée par
[Hyperfluid](https://www.hyperfluid.cloud/) avec sa base PostgreSQL interne.

## Chaîne de déploiement

1. Push (ou merge) sur `main`.
2. Le workflow `.github/workflows/hyperfluid-image.yml` lance les tests, télécharge
   les icônes (`npm run icons:bundle`), construit l'image (`Dockerfile`) et la
   publie sur `ghcr.io/notsogeek87/trusti`, puis crée le tag `hyperfluid-vX.Y.Z`.
3. Hyperfluid suit ces tags (`hyperfluid.toml`) et redéploie automatiquement.

L'image sert le build Vite (`dist/`) et monte les handlers `api/*.js` via
`server/production.js` (port 3000).

## Variables d'environnement

À définir côté Hyperfluid :

```env
DATABASE_URL=postgresql://...      # base PostgreSQL Hyperfluid
API_KEY=...                        # clé x-api-key pour les écritures (openssl rand -hex 32)
FRONTEND_URL=https://app.trusti-score.eu
NODE_ENV=production
```

## Base de données

La base vit dans le PostgreSQL d'Hyperfluid. Le workflow manuel
`hyperfluid-import-db.yml` a servi à la copier depuis l'ancienne base Neon ; il
**écrase** la base cible, à ne relancer qu'en connaissance de cause.

## Développement local

```bash
npm run dev:all   # frontend (5173) + serveur Express de dev (3001)
```

## Relais Vercel temporaire

Le projet Vercel `trusti-alpha.vercel.app` ne sert plus qu'à relayer `/api/*`
vers Hyperfluid (`vercel.json`) pour les anciennes versions de l'APK, qui
appelaient cette adresse en dur. `.vercelignore` empêche Vercel d'exécuter
lui-même `api/`. À supprimer (fichiers + projet Vercel) quand ces versions
auront disparu.
