# 2026-11-13 : bascule sur Hyperfluid, relais Vercel temporaire

> **Pour qui / Pourquoi** : explique pourquoi `vercel.json` et `.vercelignore` sont
> encore dans le dépôt alors que Trusti n'est plus hébergé sur Vercel, et quand les retirer.

## Contexte

Le site web et l'API tournent désormais dans l'image Docker publiée sur ghcr.io et
exécutée par Hyperfluid (voir [le guide de déploiement](../guides/deployment.md)).
L'APK appelait l'API à une adresse codée en dur : `https://trusti-alpha.vercel.app/api`.
Depuis le 13 novembre 2026, elle appelle notre propre domaine :

```js
// src/utils/apiConfig.js
const PROD_API_BASE = 'https://api.trusti-score.eu/api';
```

Les versions installées avant cette date continuent d'appeler l'adresse Vercel.

## Décision

Garder le projet Vercel `trusti` comme **simple relais** le temps que ces versions
disparaissent :

```json
// vercel.json
"rewrites": [
  { "source": "/api/:path*", "destination": "https://app.trusti-score.eu/api/:path*" }
]
```

`.vercelignore` exclut `api/` pour que Vercel n'exécute pas lui-même les fonctions
et laisse passer le relais. Tout le reste de ce qui était propre à Vercel est retiré :
Vercel Web Analytics (`index.html`), script `vercel-build`, docs et commentaires.

Depuis le 14 novembre 2026, `vercel.json` contient `"git": { "deploymentEnabled": false }` :
Vercel ne déploie plus à chaque push et ne publie donc plus de « deployments » ni de
statut « Vercel » sur GitHub. Le déploiement de production existant continue de servir
le relais. Pour le modifier, redéployer à la main (`vercel --prod`).

## Conséquences

- La politique de confidentialité (`public/privacy-policy.html`, et `confidentialite.html`
  du dépôt `trusti-score`) mentionne ce relais : Vercel voit passer les données techniques
  de connexion (IP, date, URL) des anciennes versions, avec un possible transfert hors UE.
- **Pour retirer le relais** : supprimer `vercel.json`, `.vercelignore` et le projet Vercel
  `trusti`, puis retirer la sous-section « Vercel – Relais temporaire » des deux politiques
  de confidentialité et mettre à jour leur date.
