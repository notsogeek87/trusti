# 2026-11-19 : API partenaires `/api/v1`, séparée de l'API interne

**Pour qui / Pourquoi** : pour comprendre pourquoi les partenaires n'utilisent pas
`/api/apps`, et ce qu'il ne faut pas casser.

## Contexte

Des partenaires veulent lire les notes TrustiScore et leur détail (critères, sources).
`GET /api/apps` est déjà public, mais :

- son format suit l'interface (couleur, popularité, choix de l'équipe…) et change avec elle ;
- la même route porte les écritures (`POST`/`PUT`/`DELETE` avec `x-api-key`) ;
- elle mélange une douzaine de modes par paramètres, difficiles à documenter ;
- elle ne permet pas de savoir qui l'utilise ni de limiter un client précis.

## Décision

- **Une API distincte `/api/v1`**, en lecture seule, avec un contrat écrit à la main
  (`server/publicApi/format.js`) et une spec OpenAPI. L'API interne ne change pas.
- **Une clé par partenaire** (`Authorization: Bearer tsk_...`), stockée en base sous
  forme d'empreinte SHA-256 (table `api_partners`). On peut alors suspendre un partenaire,
  régler son débit et voir sa dernière utilisation. La clé admin `API_KEY` n'est pas
  réutilisée.
- **Pas de CORS** : appels de serveur à serveur uniquement, pour que les clés restent
  secrètes.
- **Licence des données : CC BY 4.0.** Réutilisation libre, même commerciale, avec
  attribution « Source : TrustiScore ». L'ODbL a été écartée : elle oblige à republier
  les bases dérivées sous la même licence, ce qui freine les partenaires. Le changement
  se fait en un seul endroit (`DATA_LICENSE`).
- **Le détail complet est exposé** (justifications, sources, notes corrigées à la main).
  Le `summary` interne de l'historique reste exclu, comme dans l'app.

## Conséquences

- Un champ ne peut plus être retiré ni renommé en v1 : il faut une `/api/v2`.
- Les limites de débit et le cache sont en mémoire, comme le reste de `protection.js` :
  à revoir s'il y a un jour plusieurs réplicas.
- Ouvrir l'API demande d'appliquer la migration `2026-11-19-api-partners.sql`. Sans la
  table, toutes les clés sont refusées.
