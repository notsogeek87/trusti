# 2026-10-11 : Tailwind compilé au build (fin du CDN)

**Pour qui / Pourquoi** : pour qui touche aux styles ou à la CSP. Jusqu'ici `index.html` chargeait
`https://cdn.tailwindcss.com` (script tiers non versionné, compilé dans le navigateur, déconseillé en production)
et la dépendance npm `tailwindcss` n'était pas utilisée. Risques : exécution de code tiers à chaque démarrage,
indisponibilité hors ligne, impossibilité d'une CSP stricte.

## Décision

- Tailwind 3.4 est compilé par PostCSS au build (`postcss.config.js`, `tailwind.config.js`) ; le CSS généré fait ~50 Ko.
- La palette « Ciel & encre bleue » qui vivait dans `index.html` est dans `tailwind.config.js` (même contenu).
- Le script CDN est supprimé. Rendu vérifié identique (capture mobile avant/après).
- Tailwind 4 non adopté : aucune raison de sécurité, et son rendu par défaut diffère.

```bash
npm run build   # produit dist/ avec la CSS compilée
```
